import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendOrderConfirmationEmail } from "@/lib/email";

// Use service role client for admin operations with explicit bypass of RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(req: NextRequest) {
  try {
    const { orderId, trackingNumber } = await req.json();

    if (!orderId || !trackingNumber) {
      return NextResponse.json({ error: "orderId and trackingNumber are required" }, { status: 400 });
    }

    // Update the tracking number using admin RPC function
    const { error: updateError } = await supabase.rpc('admin_update_tracking', {
      p_order_id: orderId,
      p_tracking: trackingNumber.trim()
    });

    if (updateError) {
      console.error("Failed to update tracking:", updateError);
      return NextResponse.json(
        { error: "Failed to save tracking number" },
        { status: 500 }
      );
    }

    // Fetch order with items
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        id,
        user_id,
        total,
        shipping_address,
        order_items(
          quantity,
          products(name, price)
        )
      `)
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Failed to fetch order:", orderError);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Fetch user profile separately
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", order.user_id)
      .single();

    if (profileError || !profile?.email) {
      console.error("Failed to fetch profile:", profileError);
      return NextResponse.json(
        { error: "Customer email not found" },
        { status: 400 }
      );
    }

    // Map order items to email format
    const items = (order.order_items || []).map((item: any) => ({
      name: item.products?.name || "Unknown Product",
      quantity: item.quantity || 1,
      price: item.products?.price || 0,
    }));

    // Send tracking email
    await sendOrderConfirmationEmail({
      to: profile.email,
      userName: profile.full_name || "Customer",
      orderId,
      total: order.total || 0,
      items,
      shippingAddress: {
        ...(order.shipping_address || {}),
      },
      trackingNumber: trackingNumber.trim(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Send tracking error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
