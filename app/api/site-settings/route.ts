import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value")
      .eq("category", "advertised_times");

    if (error) {
      console.error("Error fetching site settings:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Convert to key-value object for easier consumption
    const settings: Record<string, string> = {};
    data?.forEach((item) => {
      settings[item.key] = item.value;
    });

    return NextResponse.json(settings);
  } catch (err) {
    console.error("Error in site-settings API:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
