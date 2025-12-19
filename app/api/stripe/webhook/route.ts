import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { sendOrderConfirmationEmail, sendBookingConfirmationEmail } from "@/lib/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

// Use service role client for webhooks (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    const restoreSlotsForSession = async (
      sessionId: string,
      newStatus: string,
      orderId?: string
    ) => {
      const { data: bookingsToCancel, error: fetchError } = await supabase
        .from("bookings")
        .select("id, slot_id, order_id, bundle_booking_id")
        .or(orderId ? `order_id.eq.${orderId},notes.ilike.%${sessionId}%` : `notes.ilike.%${sessionId}%`);

      if (fetchError) {
        console.error("Failed to fetch bookings for session restore:", fetchError);
        return;
      }

      if (!bookingsToCancel || !bookingsToCancel.length) return;

      // Update booking statuses
      const { error: bookingUpdateError } = await supabase
        .from("bookings")
        .update({ status: newStatus })
        .ilike("notes", `%${sessionId}%`);

      if (bookingUpdateError) {
        console.error("Failed to update booking statuses:", bookingUpdateError);
      }

      // Also cancel any bundle bookings
      const bundleBookingIds = bookingsToCancel
        .filter((b) => b.bundle_booking_id)
        .map((b) => b.bundle_booking_id);

      if (bundleBookingIds.length > 0) {
        const { error: bundleUpdateError } = await supabase
          .from("bundle_bookings")
          .update({ status: "cancelled" })
          .in("id", bundleBookingIds);

        if (bundleUpdateError) {
          console.error("Failed to update bundle booking statuses:", bundleUpdateError);
        }
      }

      // Restore slot counts
      const slotsToRestore = bookingsToCancel
        .filter((b) => b.slot_id)
        .reduce<Record<string, number>>((acc, b) => {
          const id = b.slot_id as string;
          acc[id] = (acc[id] || 0) + 1;
          return acc;
        }, {});

      for (const [slotId, qty] of Object.entries(slotsToRestore)) {
        const { data: slot, error: slotError } = await supabase
          .from("time_slots")
          .select("id, booked_count")
          .eq("id", slotId)
          .single();

        if (slotError || !slot) {
          console.error("Slot not found when restoring:", slotId, slotError);
          continue;
        }

        const newCount = Math.max(0, (slot.booked_count ?? 0) - qty);
        const { error: updateSlotError } = await supabase
          .from("time_slots")
          .update({ booked_count: newCount })
          .eq("id", slotId);

        if (updateSlotError) {
          console.error("Failed to restore slot booked_count:", updateSlotError);
        }
      }
    };

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log("Checkout session completed:", session.id);
        console.log("Metadata:", session.metadata);

        // Update order status
        const orderId = session.metadata?.orderId;
        if (!orderId) {
          console.error("No orderId in session metadata");
          break;
        }

        const { error: updateError } = await supabase
          .from("orders")
          .update({
            status: "processing",
            stripe_payment_id: session.payment_intent as string,
            stripe_payment_status: "succeeded",
          })
          .eq("id", orderId);

        if (updateError) {
          console.error("Failed to update order:", updateError);
        } else {
          console.log(`Order ${orderId} updated to processing`);
        }

        // Handle booking items (if any) passed via metadata.bookingItems
        const bookingItemsRaw = session.metadata?.bookingItems;
        const userId = session.metadata?.userId;
        if (bookingItemsRaw && userId) {
          try {
            const bookingItems = JSON.parse(bookingItemsRaw as string) as Array<{
              serviceId: string | null;
              slotId: string | null;
              startTime?: string | null;
              endTime?: string | null;
              price: number;
              quantity: number;
              name?: string;
            }>;

            if (bookingItems.length) {
              const bookingRows: any[] = [];

              for (const b of bookingItems) {
                if (!b.slotId) {
                  bookingRows.push({
                    user_id: userId,
                    service_id: b.serviceId,
                    slot_id: null,
                    order_id: orderId,
                    status: "confirmed",
                    notes: `Paid via Stripe session ${session.id} for order ${orderId} (no slot)`,
                  });
                  continue;
                }

                // Fetch slot to check availability
                const { data: slot, error: slotError } = await supabase
                  .from("time_slots")
                  .select("id, capacity, booked_count")
                  .eq("id", b.slotId)
                  .single();

                if (slotError || !slot) {
                  console.error("Slot not found for booking item:", b.slotId, slotError);
                  continue;
                }

                const available = (slot.capacity ?? 0) - (slot.booked_count ?? 0);
                const qty = b.quantity ?? 1;
                if (available < qty) {
                  console.error(`Not enough availability for slot ${b.slotId}. Available ${available}, requested ${qty}`);
                  continue;
                }

                const newBookedCount = (slot.booked_count ?? 0) + qty;
                const { error: updateSlotError } = await supabase
                  .from("time_slots")
                  .update({ booked_count: newBookedCount })
                  .eq("id", b.slotId);

                if (updateSlotError) {
                  console.error("Failed to update slot capacity:", updateSlotError);
                  continue;
                }

                bookingRows.push({
                  user_id: userId,
                  service_id: b.serviceId,
                  slot_id: b.slotId,
                  order_id: orderId,
                  status: "confirmed",
                  notes: `Paid via Stripe session ${session.id} for order ${orderId}`,
                });
              }

              if (bookingRows.length) {
                const { data: insertedBookings, error: bookingInsertError } = await supabase
                  .from("bookings")
                  .insert(bookingRows)
                  .select();

                if (bookingInsertError) {
                  console.error("Failed to insert booking items from checkout:", bookingInsertError);
                } else {
                  console.log(`Inserted ${bookingRows.length} booking(s) from checkout`);
                  if (insertedBookings && insertedBookings.length) {
                    const orderBookingLinks = insertedBookings.map((b: any) => ({
                      order_id: orderId,
                      booking_id: b.id,
                      service_id: b.service_id,
                      slot_id: b.slot_id,
                    }));
                    const { error: linkError } = await supabase
                      .from("order_bookings")
                      .insert(orderBookingLinks);
                    if (linkError) {
                      console.error("Failed to link bookings to orders:", linkError);
                    }

                    // Send booking confirmation emails
                    try {
                      // Fetch user profile once
                      const { data: profile } = await supabase
                        .from("profiles")
                        .select("email, full_name")
                        .eq("id", userId)
                        .single();

                      if (profile?.email) {
                        await Promise.all(
                          insertedBookings.map(async (b: any) => {
                            if (!b.slot_id) return;
                            const { data: slotData } = await supabase
                              .from("time_slots")
                              .select("start_time, end_time, services(name)")
                              .eq("id", b.slot_id)
                              .single();

                            await sendBookingConfirmationEmail({
                              to: profile.email,
                              userName: profile.full_name || "Customer",
                              serviceName: (slotData?.services as any)?.name || "Service",
                              startTime: slotData?.start_time || new Date().toISOString(),
                              endTime: slotData?.end_time || new Date().toISOString(),
                              bookingId: b.id,
                              status: "confirmed",
                            });
                          })
                        );
                      }
                    } catch (emailErr) {
                      console.error("Failed to send booking confirmation email(s):", emailErr);
                    }
                  }
                }
              }
            }
          } catch (err) {
            console.error("Failed to parse bookingItems metadata:", err);
          }
        }

        // Handle bundle items (if any) passed via metadata.bundleItems
        const bundleItemsRaw = session.metadata?.bundleItems;
        if (bundleItemsRaw && userId) {
          try {
            const bundleItems = JSON.parse(bundleItemsRaw as string) as Array<{
              bundleId: string | null;
              bundleBookingId: string | null;
              slotId: string | null;
              startTime?: string | null;
              endTime?: string | null;
              price: number;
              lateFee: number;
              quantity: number;
              name?: string;
              includedServices: Array<{ serviceId: string; serviceName: string }>;
            }>;

            if (bundleItems.length) {
              for (const b of bundleItems) {
                if (!b.bundleBookingId) {
                  console.error("No bundle booking ID provided for bundle item");
                  continue;
                }

                // Update bundle booking status to confirmed
                const { error: updateBundleError } = await supabase
                  .from("bundle_bookings")
                  .update({ status: "confirmed" })
                  .eq("id", b.bundleBookingId);

                if (updateBundleError) {
                  console.error("Failed to confirm bundle booking:", updateBundleError);
                  continue;
                }

                // Update all associated service bookings to confirmed
                const { error: updateBookingsError } = await supabase
                  .from("bookings")
                  .update({ status: "confirmed" })
                  .eq("bundle_booking_id", b.bundleBookingId);

                if (updateBookingsError) {
                  console.error("Failed to confirm bundle service bookings:", updateBookingsError);
                } else {
                  console.log(`Confirmed bundle booking ${b.bundleBookingId} and all service bookings`);
                }
              }
            }
          } catch (err) {
            console.error("Failed to parse bundleItems metadata:", err);
          }
        }

        // Send order confirmation email
        try {
          const { data: orderDetails, error: orderFetchError } = await supabase
            .from("orders")
            .select("*, order_items(*, products(name))")
            .eq("id", orderId)
            .single();

          if (orderFetchError || !orderDetails) {
            console.error("Failed to fetch order for email:", orderFetchError);
          } else {
            // Get user email from profiles
            const { data: profile } = await supabase
              .from("profiles")
              .select("email, full_name")
              .eq("id", userId)
              .single();

            if (profile?.email) {
              // Build items array for email (products) or fallback to booking metadata
              let emailItems =
                (orderDetails.order_items || []).map((item: any) => ({
                  name: item.products?.name || "Product",
                  quantity: item.quantity,
                  price: item.price,
                })) || [];

              if (!emailItems.length && bookingItemsRaw) {
                try {
                  const parsed = JSON.parse(bookingItemsRaw as string) as Array<{
                    name?: string;
                    price: number;
                    quantity: number;
                  }>;
                  emailItems = parsed.map((b) => ({
                    name: b.name || "Booking",
                    quantity: b.quantity || 1,
                    price: b.price,
                  }));
                } catch (e) {
                  console.error("Failed to parse booking items for order email fallback:", e);
                }
              }

              await sendOrderConfirmationEmail({
                to: profile.email,
                userName: profile.full_name || "Customer",
                orderId: orderDetails.id,
                total: orderDetails.total,
                items: emailItems,
                shippingAddress: orderDetails.shipping_address,
              });

              console.log(`Order confirmation email sent to ${profile.email}`);
            }
          }
        } catch (emailError) {
          console.error("Error sending order confirmation email:", emailError);
          // Don't fail the webhook if email fails
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("PaymentIntent succeeded:", paymentIntent.id);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("PaymentIntent failed:", paymentIntent.id);

        // Find order by payment intent ID and mark as failed
        const { data: orders } = await supabase
          .from("orders")
          .select("id")
          .eq("stripe_payment_id", paymentIntent.id);

        const orderIdForRestore: string | undefined =
          (orders && orders.length > 0 && (orders[0].id as string)) ||
          (paymentIntent.metadata?.orderId as string | undefined);

        if (orderIdForRestore) {
          await supabase
            .from("orders")
            .update({
              status: "cancelled",
              stripe_payment_status: "failed",
            })
            .eq("id", orderIdForRestore);
        }
        // Cancel related bookings and restore availability
        await restoreSlotsForSession(paymentIntent.id, "cancelled", orderIdForRestore);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        console.log("Charge refunded:", charge.id);

        // Find order by payment intent ID and mark as refunded
        const { data: orders } = await supabase
          .from("orders")
          .select("id")
          .eq("stripe_payment_id", charge.payment_intent as string);

        const orderIdForRestore: string | undefined =
          (orders && orders.length > 0 && (orders[0].id as string)) ||
          (charge.metadata?.orderId as string | undefined);

        if (orderIdForRestore) {
          await supabase
            .from("orders")
            .update({
              status: "refunded",
              stripe_payment_status: "refunded",
            })
            .eq("id", orderIdForRestore);
        }
        // Restore slots and mark bookings refunded/cancelled
        await restoreSlotsForSession(charge.payment_intent as string, "cancelled", orderIdForRestore);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
