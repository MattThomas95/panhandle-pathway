import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { CreateBundleRequest } from "@/types/bundle";

// GET /api/admin/bundles - List all bundles
export async function GET(req: NextRequest) {
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

    // Fetch all bundles
    const { data: bundles, error: bundlesError } = await supabase
      .from("bundles")
      .select("*")
      .order("created_at", { ascending: false });

    if (bundlesError) {
      console.error("Error fetching bundles:", bundlesError);
      return NextResponse.json(
        { error: "Failed to fetch bundles" },
        { status: 500 }
      );
    }

    // For each bundle, fetch its services
    const bundlesWithServices = await Promise.all(
      (bundles || []).map(async (bundle) => {
        const { data: services } = await supabase.rpc("get_bundle_services", {
          p_bundle_id: bundle.id,
        });

        return {
          ...bundle,
          services: services || [],
        };
      })
    );

    return NextResponse.json({ bundles: bundlesWithServices });
  } catch (error) {
    console.error("Unexpected error in list bundles API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/bundles - Create new bundle
export async function POST(req: NextRequest) {
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

    const body: CreateBundleRequest = await req.json();
    const {
      name,
      description,
      custom_price,
      late_fee_days = 0,
      late_fee_amount = 0,
      service_ids,
      is_active = true,
    } = body;

    // Validate required fields
    if (!name || custom_price === undefined || !service_ids || service_ids.length < 2) {
      return NextResponse.json(
        { error: "name, custom_price, and at least 2 service_ids are required" },
        { status: 400 }
      );
    }

    // Create bundle
    const { data: bundle, error: bundleError } = await supabase
      .from("bundles")
      .insert({
        name,
        description: description || null,
        custom_price,
        late_fee_days,
        late_fee_amount,
        is_active,
      })
      .select()
      .single();

    if (bundleError) {
      console.error("Error creating bundle:", bundleError);
      return NextResponse.json(
        { error: "Failed to create bundle" },
        { status: 500 }
      );
    }

    // Create bundle_services entries
    const bundleServices = service_ids.map((service_id) => ({
      bundle_id: bundle.id,
      service_id,
    }));

    const { error: servicesError } = await supabase
      .from("bundle_services")
      .insert(bundleServices);

    if (servicesError) {
      console.error("Error creating bundle services:", servicesError);
      // Rollback: delete the bundle
      await supabase.from("bundles").delete().eq("id", bundle.id);
      return NextResponse.json(
        { error: "Failed to associate services with bundle" },
        { status: 500 }
      );
    }

    // Fetch the created bundle with services
    const { data: services } = await supabase.rpc("get_bundle_services", {
      p_bundle_id: bundle.id,
    });

    return NextResponse.json({
      bundle: {
        ...bundle,
        services: services || [],
      },
    });
  } catch (error) {
    console.error("Unexpected error in create bundle API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
