"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/auth/login");
        return;
      }

      setUser(session.user);

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      setProfile(profileData);
      setLoading(false);
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          router.push("/auth/login");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-zinc-600 dark:text-zinc-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-xl font-bold text-black dark:text-white">
            Panhandle Pathway
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {user?.email}
            </span>
            {profile?.is_org_admin && (
              <Link
                href="/org"
                className="rounded-md bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
              >
                Org Portal
              </Link>
            )}
            {profile?.role === "admin" && (
              <Link
                href="/admin"
                className="rounded-md bg-zinc-200 px-3 py-1.5 text-sm font-medium text-black transition-colors hover:bg-zinc-300 dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600"
              >
                Admin Panel
              </Link>
            )}
            <button
              onClick={handleSignOut}
              className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-black dark:text-white">
          Welcome, {profile?.full_name || user?.email}!
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          This is your personal dashboard.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Quick Links */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-black dark:text-white">
              Quick Links
            </h2>
            <div className="mt-4 space-y-2">
              <Link
                href="/store"
                className="block text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
              >
                → Visit Store
              </Link>
              <Link
                href="/book"
                className="block text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
              >
                → Book an Appointment
              </Link>
            </div>
          </div>

          {/* Profile Info */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-black dark:text-white">
              Your Profile
            </h2>
            <div className="mt-4 space-y-2 text-sm">
              <p className="text-zinc-600 dark:text-zinc-400">
                <span className="font-medium text-black dark:text-white">Email:</span>{" "}
                {user?.email}
              </p>
              <p className="text-zinc-600 dark:text-zinc-400">
                <span className="font-medium text-black dark:text-white">Name:</span>{" "}
                {profile?.full_name || "Not set"}
              </p>
              <p className="text-zinc-600 dark:text-zinc-400">
                <span className="font-medium text-black dark:text-white">Role:</span>{" "}
                {profile?.role || "user"}
              </p>
            </div>
          </div>

          {/* Upcoming Bookings Placeholder */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-black dark:text-white">
              Upcoming Bookings
            </h2>
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              No upcoming bookings.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
