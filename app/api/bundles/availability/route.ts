import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { BundleAvailabilityResponse } from "@/types/bundle";

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const bundleId = searchParams.get("bundleId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!bundleId) {
      return NextResponse.json(
        { error: "bundleId is required" },
        { status: 400 }
      );
    }

    // Verify bundle exists and is active
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

    // Call RPC function to get matching slots
    const { data: slots, error: slotsError } = await supabase.rpc(
      "get_bundle_matching_slots",
      {
        p_bundle_id: bundleId,
        p_start_date: startDate || new Date().toISOString(),
        p_end_date: endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }
    );

    if (slotsError) {
      console.error("Error fetching bundle slots:", slotsError);
      return NextResponse.json(
        { error: "Failed to fetch available slots" },
        { status: 500 }
      );
    }

    const response: BundleAvailabilityResponse = {
      slots: slots || [],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Unexpected error in bundle availability API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
