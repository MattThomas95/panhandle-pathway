import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    // Verify user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { items, shippingAddress } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No items provided" },
        { status: 400 }
      );
    }

    // Split items by kind
    const productItems = items.filter((item: any) => item.kind !== "booking");
    const bookingItems = items.filter((item: any) => item.kind === "booking");

    // Fetch product details for product items
    const productIds = productItems.map((item: any) => item.productId);
    const { data: products, error: productsError } = productIds.length
      ? await supabase.from("products").select("*").in("id", productIds)
      : { data: [], error: null };

    if (productsError) {
      return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    // Map product items
    for (const item of productItems) {
      const product = products?.find((p) => p.id === item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            description: product.description || undefined,
            images: product.image_url ? [product.image_url] : undefined,
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: item.quantity,
      });
    }

    // Map booking items using cart price
    for (const item of bookingItems) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.productName || "Service booking",
            description: item.startTime
              ? `Booking on ${new Date(item.startTime).toLocaleDateString()} at ${new Date(item.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
              : undefined,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      });
    }

    // Calculate subtotal using cart values (booking items already carry price)
    const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

    const shippingCost = subtotal >= 50 ? 0 : 5;

    // Add shipping as a line item if applicable
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Shipping",
            description: "Standard shipping",
          },
          unit_amount: shippingCost * 100, // Convert to cents
        },
        quantity: 1,
      });
    }

    // Create order in database with pending status
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        status: "pending",
        total: subtotal + shippingCost,
        shipping_address: shippingAddress,
        stripe_payment_status: "pending",
      })
      .select()
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    // Create order items for product items only
    if (productItems.length) {
      const orderItems = productItems.map((item: any) => {
        const product = products?.find((p) => p.id === item.productId);
        return {
          order_id: order.id,
          product_id: item.productId,
          quantity: item.quantity,
          price: product?.price || 0,
        };
      });

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        // Rollback: delete the order
        await supabase.from("orders").delete().eq("id", order.id);
        return NextResponse.json(
          { error: "Failed to create order items" },
          { status: 500 }
        );
      }
    }

    // Create Stripe checkout session
    const bookingMetaString =
      bookingItems.length > 0
        ? JSON.stringify(
            bookingItems.map((b: any) => ({
              serviceId: b.serviceId ?? null,
              slotId: b.slotId ?? null,
              startTime: b.startTime ?? null,
              endTime: b.endTime ?? null,
              price: b.price,
              quantity: b.quantity,
              name: b.productName,
            }))
          )
        : undefined;

    const commonMetadata = {
      orderId: order.id,
      userId: user.id,
      bookingItems: bookingMetaString,
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin}/order-confirmation/${order.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin}/checkout?canceled=true`,
      customer_email: shippingAddress.email,
      metadata: commonMetadata,
      payment_intent_data: {
        metadata: commonMetadata,
      },
      shipping_address_collection: {
        allowed_countries: ["US"],
      },
    });

    // Update order with Stripe session ID
    await supabase
      .from("orders")
      .update({
        stripe_payment_id: session.id,
      })
      .eq("id", order.id);

    return NextResponse.json({
      sessionId: session.id,
      orderId: order.id,
    });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
