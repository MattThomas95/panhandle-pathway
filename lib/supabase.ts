import { createBrowserClient as createClient } from '@supabase/ssr';
import { createClient as createSupabaseJsClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser client for client components - uses cookies (SSR-compatible)
export function createBrowserClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Single shared instance for the application
export const supabase = createBrowserClient();

// Legacy client for ra-supabase compatibility (uses localStorage)
export const supabaseJsClient = createSupabaseJsClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
