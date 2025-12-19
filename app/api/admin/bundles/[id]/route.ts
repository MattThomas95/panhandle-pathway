import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { UpdateBundleRequest } from "@/types/bundle";

// GET /api/admin/bundles/[id] - Get single bundle
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();

    // Verify user is authenticated and is admin
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

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const bundleId = params.id;

    // Fetch bundle
    const { data: bundle, error: bundleError } = await supabase
      .from("bundles")
      .select("*")
      .eq("id", bundleId)
      .single();

    if (bundleError || !bundle) {
      return NextResponse.json(
        { error: "Bundle not found" },
        { status: 404 }
      );
    }

    // Fetch services
    const { data: services } = await supabase.rpc("get_bundle_services", {
      p_bundle_id: bundleId,
    });

    return NextResponse.json({
      bundle: {
        ...bundle,
        services: services || [],
      },
    });
  } catch (error) {
    console.error("Unexpected error in get bundle API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/bundles/[id] - Update bundle
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();

    // Verify user is authenticated and is admin
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

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const bundleId = params.id;
    const body: UpdateBundleRequest = await req.json();
    const {
      name,
      description,
      custom_price,
      late_fee_days,
      late_fee_amount,
      service_ids,
      is_active,
    } = body;

    // Build update object with only provided fields
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (custom_price !== undefined) updateData.custom_price = custom_price;
    if (late_fee_days !== undefined) updateData.late_fee_days = late_fee_days;
    if (late_fee_amount !== undefined) updateData.late_fee_amount = late_fee_amount;
    if (is_active !== undefined) updateData.is_active = is_active;

    // Update bundle if there are changes
    if (Object.keys(updateData).length > 0) {
      const { error: bundleError } = await supabase
        .from("bundles")
        .update(updateData)
        .eq("id", bundleId);

      if (bundleError) {
        console.error("Error updating bundle:", bundleError);
        return NextResponse.json(
          { error: "Failed to update bundle" },
          { status: 500 }
        );
      }
    }

    // Update services if provided
    if (service_ids && service_ids.length >= 2) {
      // Delete existing bundle_services
      const { error: deleteError } = await supabase
        .from("bundle_services")
        .delete()
        .eq("bundle_id", bundleId);

      if (deleteError) {
        console.error("Error deleting bundle services:", deleteError);
        return NextResponse.json(
          { error: "Failed to update bundle services" },
          { status: 500 }
        );
      }

      // Insert new bundle_services
      const bundleServices = service_ids.map((service_id) => ({
        bundle_id: bundleId,
        service_id,
      }));

      const { error: insertError } = await supabase
        .from("bundle_services")
        .insert(bundleServices);

      if (insertError) {
        console.error("Error inserting bundle services:", insertError);
        return NextResponse.json(
          { error: "Failed to update bundle services" },
          { status: 500 }
        );
      }
    }

    // Fetch updated bundle with services
    const { data: bundle, error: fetchError } = await supabase
      .from("bundles")
      .select("*")
      .eq("id", bundleId)
      .single();

    if (fetchError || !bundle) {
      return NextResponse.json(
        { error: "Failed to fetch updated bundle" },
        { status: 500 }
      );
    }

    const { data: services } = await supabase.rpc("get_bundle_services", {
      p_bundle_id: bundleId,
    });

    return NextResponse.json({
      bundle: {
        ...bundle,
        services: services || [],
      },
    });
  } catch (error) {
    console.error("Unexpected error in update bundle API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/bundles/[id] - Delete bundle
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();

    // Verify user is authenticated and is admin
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

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const bundleId = params.id;

    // Check if bundle has any bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from("bundle_bookings")
      .select("id")
      .eq("bundle_id", bundleId)
      .limit(1);

    if (bookingsError) {
      console.error("Error checking bundle bookings:", bookingsError);
      return NextResponse.json(
        { error: "Failed to check bundle bookings" },
        { status: 500 }
      );
    }

    if (bookings && bookings.length > 0) {
      // Instead of deleting, deactivate the bundle
      const { error: deactivateError } = await supabase
        .from("bundles")
        .update({ is_active: false })
        .eq("id", bundleId);

      if (deactivateError) {
        console.error("Error deactivating bundle:", deactivateError);
        return NextResponse.json(
          { error: "Failed to deactivate bundle" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: "Bundle has existing bookings and has been deactivated instead of deleted",
        deactivated: true,
      });
    }

    // Delete bundle (will cascade to bundle_services)
    const { error: deleteError } = await supabase
      .from("bundles")
      .delete()
      .eq("id", bundleId);

    if (deleteError) {
      console.error("Error deleting bundle:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete bundle" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Bundle deleted successfully" });
  } catch (error) {
    console.error("Unexpected error in delete bundle API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
