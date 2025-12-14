import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendBookingConfirmationEmail } from "@/lib/email";

// Use service role client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { bookingId } = await req.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    // Fetch booking details with service and slot information
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        *,
        services(name),
        time_slots(start_time, end_time),
        profiles(email, full_name)
      `)
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      console.error("Failed to fetch booking:", bookingError);
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Send confirmation email
    if (booking.profiles?.email) {
      await sendBookingConfirmationEmail({
        to: booking.profiles.email,
        userName: booking.profiles.full_name || "Customer",
        serviceName: booking.services?.name || "Service",
        startTime: booking.time_slots?.start_time || new Date().toISOString(),
        endTime: booking.time_slots?.end_time || new Date().toISOString(),
        bookingId: booking.id,
        status: "confirmed",
      });

      console.log(`Booking confirmation email sent to ${booking.profiles.email}`);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "No email address found" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error sending booking confirmation:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send confirmation email" },
      { status: 500 }
    );
  }
}
