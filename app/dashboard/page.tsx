"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";

const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

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

      // Fetch upcoming bookings
      const { data: bookingsData } = await supabase
        .from("bookings")
        .select(`
          *,
          services (name),
          time_slots (start_time, end_time)
        `)
        .eq("user_id", session.user.id)
        .in("status", ["confirmed", "pending"])
        .gte("time_slots.start_time", new Date().toISOString())
        .order("time_slots(start_time)", { ascending: true })
        .limit(5);

      setBookings(bookingsData || []);
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

  const fetchBookings = async () => {
    if (!user) return;

    const { data: bookingsData } = await supabase
      .from("bookings")
      .select(`
        *,
        services (name),
        time_slots (start_time, end_time)
      `)
      .eq("user_id", user.id)
      .in("status", ["confirmed", "pending"])
      .gte("time_slots.start_time", new Date().toISOString())
      .order("time_slots(start_time)", { ascending: true })
      .limit(5);

    setBookings(bookingsData || []);
  };

  const handleCancelClick = (booking: any) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedBooking) return;

    setCancellingId(selectedBooking.id);

    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", selectedBooking.id);

    if (error) {
      console.error("Error cancelling booking:", error);
      alert("Failed to cancel booking. Please try again.");
    } else {
      // Refresh bookings
      await fetchBookings();
    }

    setCancellingId(null);
    setShowCancelModal(false);
    setSelectedBooking(null);
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

          {/* Upcoming Bookings */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-black dark:text-white">
              Upcoming Bookings
            </h2>
            {bookings.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                No upcoming bookings.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {bookings.map((booking: any) => (
                  <div
                    key={booking.id}
                    className="rounded-md border border-zinc-200 p-3 dark:border-zinc-700"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-black dark:text-white">
                          {booking.services?.name}
                        </p>
                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                          {new Date(booking.time_slots?.start_time).toLocaleDateString()} at{" "}
                          {new Date(booking.time_slots?.start_time).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <span
                          className={`mt-2 inline-block rounded-full px-2 py-1 text-xs font-medium ${
                            booking.status === "confirmed"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCancelClick(booking)}
                        disabled={cancellingId === booking.id}
                        className="ml-2 rounded-md px-2 py-1 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-lg font-semibold text-black dark:text-white">
              Cancel Booking?
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Are you sure you want to cancel your booking for{" "}
              <strong className="text-black dark:text-white">
                {selectedBooking.services?.name}
              </strong>{" "}
              on{" "}
              <strong className="text-black dark:text-white">
                {new Date(selectedBooking.time_slots?.start_time).toLocaleDateString()}
              </strong>{" "}
              at{" "}
              <strong className="text-black dark:text-white">
                {new Date(selectedBooking.time_slots?.start_time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </strong>
              ?
            </p>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              This action cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedBooking(null);
                }}
                disabled={cancellingId !== null}
                className="flex-1 rounded-md border border-zinc-300 bg-white py-2 text-black transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelConfirm}
                disabled={cancellingId !== null}
                className="flex-1 rounded-md bg-red-600 py-2 text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cancellingId ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
