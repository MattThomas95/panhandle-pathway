import { createClient } from "@supabase/supabase-js";

// Basic server-side Supabase client (anon key). For authenticated calls, pass the user's bearer token manually.
export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, supabaseAnonKey);
}
