import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: "orderId required" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get order to ensure ownership
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, user_id, status, stripe_payment_id")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch related bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("id, slot_id, status, time_slots (booked_count, capacity)")
      .eq("order_id", orderId);

    if (bookingsError) {
      return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
    }

    // Restore slot counts
    if (bookings && bookings.length > 0) {
      const slotCounts = bookings.reduce<Record<string, number>>((acc, b) => {
        if (b.slot_id) {
          acc[b.slot_id] = (acc[b.slot_id] || 0) + 1;
        }
        return acc;
      }, {});

      for (const [slotId, qty] of Object.entries(slotCounts)) {
        const { data: slot, error: slotErr } = await supabase
          .from("time_slots")
          .select("booked_count, capacity")
          .eq("id", slotId)
          .single();
        if (slotErr || !slot) continue;
        const newCount = Math.max(0, (slot.booked_count ?? 0) - qty);
        const isAvailable = newCount < (slot.capacity ?? 0);
        await supabase.from("time_slots").update({ booked_count: newCount, is_available: isAvailable }).eq("id", slotId);
      }

      // Remove bookings entirely to avoid unique constraint conflicts on rebook
      await supabase
        .from("bookings")
        .delete()
        .eq("order_id", orderId);
    }

    // Update order status
    await supabase
      .from("orders")
      .update({ status: "cancelled", stripe_payment_status: "cancelled" })
      .eq("id", orderId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Order cancel error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
