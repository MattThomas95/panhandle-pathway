"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const AdminApp = dynamic(() => import("@/components/AdminApp"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="text-zinc-600 dark:text-zinc-400">Loading admin panel...</div>
    </div>
  ),
});

export default function AdminPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      console.log("Admin page - checkAuth:", {
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
      });

      if (!session) {
        console.log("No session found, redirecting to login");
        router.push("/auth/login?redirectedFrom=/admin");
        return;
      }

      // Check if user is admin
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      console.log("Profile check:", { profile, profileError, role: profile?.role });

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        setError("Error loading profile. Please try again.");
        setLoading(false);
        return;
      }

      if (profile?.role !== "admin") {
        console.log("Not admin, user role is:", profile?.role);
        setError("Access denied. Admin privileges required.");
        setLoading(false);
        return;
      }

      console.log("Auth check passed, user is admin");
      setAuthorized(true);
      setMounted(true);
      setLoading(false);
    } catch (err) {
      console.error("Auth check error:", err);
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkAuth();
  }, [checkAuth]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-zinc-600 dark:text-zinc-400">Checking permissions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-4 rounded-md bg-black px-4 py-2 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!mounted || !authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-zinc-600 dark:text-zinc-400">Initializing...</div>
      </div>
    );
  }

  return <AdminApp />;
}
