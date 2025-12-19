import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { CreateBundleBookingRequest, CreateBundleBookingResponse } from "@/types/bundle";

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

    const body: CreateBundleBookingRequest = await req.json();
    const { bundleId, slotStartTime } = body;

    if (!bundleId || !slotStartTime) {
      return NextResponse.json(
        { error: "bundleId and slotStartTime are required" },
        { status: 400 }
      );
    }

    // Fetch bundle details with services
    const { data: bundle, error: bundleError } = await supabase
      .from("bundles")
      .select("*")
      .eq("id", bundleId)
      .eq("is_active", true)
      .single();

    if (bundleError || !bundle) {
      return NextResponse.json(
        { error: "Bundle not found or inactive" },
        { status: 404 }
      );
    }

    // Fetch bundle services
    const { data: services, error: servicesError } = await supabase.rpc(
      "get_bundle_services",
      { p_bundle_id: bundleId }
    );

    if (servicesError) {
      console.error("Error fetching bundle services:", servicesError);
      return NextResponse.json(
        { error: "Failed to fetch bundle services" },
        { status: 500 }
      );
    }

    // Get time slot details
    const { data: slots, error: slotsError } = await supabase
      .from("time_slots")
      .select("*")
      .eq("start_time", slotStartTime)
      .in("service_id", services.map((s: any) => s.service_id))
      .limit(1)
      .single();

    if (slotsError || !slots) {
      return NextResponse.json(
        { error: "Time slot not found" },
        { status: 404 }
      );
    }

    // Call RPC function to create bundle booking atomically
    const { data: bundleBookingId, error: bookingError } = await supabase.rpc(
      "create_bundle_booking",
      {
        p_bundle_id: bundleId,
        p_user_id: user.id,
        p_slot_start_time: slotStartTime,
      }
    );

    if (bookingError) {
      console.error("Error creating bundle booking:", bookingError);
      return NextResponse.json(
        { error: bookingError.message || "Failed to create bundle booking" },
        { status: 400 }
      );
    }

    // Fetch the created bundle booking
    const { data: bundleBooking, error: fetchError } = await supabase
      .from("bundle_bookings")
      .select("*")
      .eq("id", bundleBookingId)
      .single();

    if (fetchError || !bundleBooking) {
      return NextResponse.json(
        { error: "Failed to fetch created booking" },
        { status: 500 }
      );
    }

    const response: CreateBundleBookingResponse = {
      bundleBookingId: bundleBooking.id,
      bundleId: bundle.id,
      bundleName: bundle.name,
      price: bundle.custom_price,
      lateFee: bundleBooking.late_fee,
      totalPrice: bundleBooking.total_price,
      bundle: {
        ...bundle,
        services: services.map((s: any) => ({
          id: s.service_id,
          name: s.service_name,
          price: s.service_price,
        })),
      },
      slot: {
        id: slots.id,
        start_time: slots.start_time,
        end_time: slots.end_time,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Unexpected error in bundle booking API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
