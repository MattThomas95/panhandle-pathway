"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  ShoppingBag,
  CalendarCheck,
  Mail,
  ShieldCheck,
  Building2,
  LogOut,
  XCircle,
  Package,
  Clock,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { FloatingEmojis, SparkleStars, GradientOrbs } from "@/components/ui/floating-elements";

type Booking = {
  id: string;
  status: string;
  services: { name: string } | null;
  time_slots: { start_time: string; end_time: string } | null;
};

type Order = {
  id: string;
  total: number;
  status: string;
  stripe_payment_status: string | null;
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [orderIdInput, setOrderIdInput] = useState("");
  const [orderCancelMessage, setOrderCancelMessage] = useState<string | null>(null);
  const [orderCancelError, setOrderCancelError] = useState<string | null>(null);
  const [orderCancelLoading, setOrderCancelLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth/login");
        return;
      }
      if (!mounted) return;

      setUser(session.user);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      if (mounted) setProfile(profileData);

      await Promise.all([fetchBookings(session.user.id, mounted), fetchOrders(session.user.id, mounted)]);
      if (mounted) setLoading(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        router.push("/auth/login");
      }
      if (event === "SIGNED_IN" && session && mounted) {
        setUser(session.user);
        fetchBookings(session.user.id, mounted);
        fetchOrders(session.user.id, mounted);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const fetchBookings = async (userId?: string, mounted = true) => {
    const targetId = userId || user?.id;
    if (!targetId) return;

    const { data: bookingsData } = await supabase
      .from("bookings")
      .select(
        `
        id,
        status,
        services (name),
        time_slots (start_time, end_time)
      `
      )
      .eq("user_id", targetId)
      .in("status", ["confirmed", "pending"])
      .gte("time_slots.start_time", new Date().toISOString())
      .order("time_slots(start_time)", { ascending: true })
      .limit(5);

    if (mounted) setBookings((bookingsData as any) || []);
  };

  const fetchOrders = async (userId?: string, mounted = true) => {
    const targetId = userId || user?.id;
    if (!targetId) return;
    const { data, error } = await supabase
      .from("orders")
      .select("id, total, status, stripe_payment_status, created_at")
      .eq("user_id", targetId)
      .order("created_at", { ascending: false })
      .limit(5);
    if (!mounted) return;
    if (error) {
      console.error("Failed to fetch orders:", error);
      return;
    }
    setOrders((data as Order[]) || []);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleCancelClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedBooking) return;
    setCancellingId(selectedBooking.id);

    try {
      const { data: bookingRow, error: fetchErr } = await supabase
        .from("bookings")
        .select("id, slot_id")
        .eq("id", selectedBooking.id)
        .single();

      if (fetchErr) throw fetchErr;

      if (bookingRow?.slot_id) {
        const { data: slot } = await supabase
          .from("time_slots")
          .select("booked_count, capacity")
          .eq("id", bookingRow.slot_id)
          .single();

        if (slot) {
          const newCount = Math.max(0, (slot.booked_count ?? 0) - 1);
          const isAvailable = newCount < (slot.capacity ?? 0);
          await supabase
            .from("time_slots")
            .update({ booked_count: newCount, is_available: isAvailable })
            .eq("id", bookingRow.slot_id);
        }
      }

      const { error: deleteErr } = await supabase
        .from("bookings")
        .delete()
        .eq("id", selectedBooking.id);

      if (deleteErr) throw deleteErr;

      await fetchBookings();
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("Failed to cancel booking. Please try again.");
    }

    setCancellingId(null);
    setShowCancelModal(false);
    setSelectedBooking(null);
  };

  const handleOrderCancel = async () => {
    setOrderCancelError(null);
    setOrderCancelMessage(null);
    if (!orderIdInput.trim()) {
      setOrderCancelError("Enter an order ID");
      return;
    }
    setOrderCancelLoading(true);
    try {
      const res = await fetch("/api/orders/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderIdInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel order");
      }
      setOrderCancelMessage("Order cancelled and any bookings released.");
      setOrderIdInput("");
      await fetchBookings();
    } catch (err: any) {
      setOrderCancelError(err.message || "Failed to cancel order");
    } finally {
      setOrderCancelLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="section-container py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-[var(--blue-200)] border-t-[var(--primary)] animate-spin" />
          <p className="text-[var(--foreground-muted)] font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const headerActions = (
    <div className="flex items-center gap-3 flex-wrap">
      {profile?.role === "admin" && (
        <Button variant="primary" size="sm" asChild>
          <Link href="/admin"><ShieldCheck className="h-4 w-4" /> Admin Panel</Link>
        </Button>
      )}
      {profile?.is_org_admin && (
        <Button variant="primary" size="sm" className="bg-[var(--teal-500)] hover:bg-[var(--teal-600)]" asChild>
          <Link href="/org"><Building2 className="h-4 w-4" /> Org Portal</Link>
        </Button>
      )}
      <Button variant="ghost" size="sm" onClick={handleSignOut}>
        <LogOut className="h-4 w-4" /> Sign out
      </Button>
    </div>
  );

  return (
    <>
      {/* Floating decorations - dashboard page */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <GradientOrbs />
        <SparkleStars count={35} color="rgba(255, 204, 0, 0.6)" />
        <FloatingEmojis
          emojis={["🌴", "☀️", "🌊", "🎓", "📚", "✨", "🐚", "🌺", "⭐", "🦋", "🌈", "💛"]}
          count={12}
        />
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        <PageHeader
          badge="Account"
          title={`Hi, ${profile?.full_name || user?.email}`}
          description="Manage your bookings, profile, and settings."
        >
          {headerActions}
        </PageHeader>

        {/* Quick cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Profile */}
        <Card>
          <CardHeader>
            <div className="w-10 h-10 rounded-xl bg-[var(--blue-50)] text-[var(--primary)] flex items-center justify-center mb-2">
              <User className="h-5 w-5" />
            </div>
            <CardTitle>Your profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--foreground-muted)]">Email</span>
              <span className="font-medium truncate ml-2">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--foreground-muted)]">Name</span>
              <span className="font-medium">{profile?.full_name || "Not set"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--foreground-muted)]">Role</span>
              <Badge variant={profile?.role === "admin" ? "default" : "secondary"}>
                {profile?.role || "user"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Quick links */}
        <Card>
          <CardHeader>
            <div className="w-10 h-10 rounded-xl bg-[var(--gold-50)] text-[var(--gold-600)] flex items-center justify-center mb-2">
              <ArrowRight className="h-5 w-5" />
            </div>
            <CardTitle>Quick links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
              <Link href="/store"><ShoppingBag className="h-4 w-4" /> Visit store</Link>
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
              <Link href="/book"><CalendarCheck className="h-4 w-4" /> Book an appointment</Link>
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
              <Link href="/orders"><Package className="h-4 w-4" /> View all orders</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Support */}
        <Card>
          <CardHeader>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
              <Mail className="h-5 w-5" />
            </div>
            <CardTitle>Support</CardTitle>
            <CardDescription>Need help? Reach out to support anytime.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="secondary" size="sm" asChild>
              <a href="mailto:support@panhandlepathways.com"><Mail className="h-4 w-4" /> Email support</a>
            </Button>
          </CardFooter>
        </Card>

        {/* Cancel order */}
        <Card>
          <CardHeader>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mb-2">
              <XCircle className="h-5 w-5" />
            </div>
            <CardTitle>Cancel order</CardTitle>
            <CardDescription>Cancel an order and release associated bookings.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <input
                type="text"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                placeholder="Order ID"
                className="flex-1 min-w-0 rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={handleOrderCancel}
                disabled={orderCancelLoading}
              >
                {orderCancelLoading ? "..." : "Cancel"}
              </Button>
            </div>
            {orderCancelError && (
              <p className="mt-2 text-sm font-semibold text-red-600">{orderCancelError}</p>
            )}
            {orderCancelMessage && (
              <p className="mt-2 text-sm font-semibold text-emerald-600">{orderCancelMessage}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent orders */}
      <section className="space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] mb-1">Orders</p>
          <h2 className="font-heading text-2xl font-bold text-[var(--foreground)]">Recent orders</h2>
        </div>
        {orders.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <Package className="h-10 w-10 mx-auto text-[var(--foreground-muted)] mb-3 opacity-40" />
              <p className="text-[var(--foreground-muted)] font-medium">No orders yet.</p>
              <Button variant="primary" size="sm" className="mt-4" asChild>
                <Link href="/store">Browse store</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {orders.slice(0, 3).map((order) => (
              <Link key={order.id} href={`/orders#${order.id}`} className="block group">
                <Card className="transition-shadow group-hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Order #{order.id.slice(0, 8)}</CardTitle>
                      <Badge variant={order.status === "paid" ? "default" : "secondary"}>
                        {order.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      ${order.total.toFixed(2)} &middot; {new Date(order.created_at).toLocaleDateString()}
                      {order.stripe_payment_status && ` (${order.stripe_payment_status})`}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
        {orders.length > 0 && (
          <Button variant="secondary" size="sm" asChild>
            <Link href="/orders">View all orders <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        )}
      </section>

      {/* Upcoming bookings */}
      <section className="space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] mb-1">Bookings</p>
          <h2 className="font-heading text-2xl font-bold text-[var(--foreground)]">Upcoming bookings</h2>
        </div>
        {bookings.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <Clock className="h-10 w-10 mx-auto text-[var(--foreground-muted)] mb-3 opacity-40" />
              <p className="text-[var(--foreground-muted)] font-medium">No upcoming bookings.</p>
              <Button variant="primary" size="sm" className="mt-4" asChild>
                <Link href="/book">Book now</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <CardTitle className="text-base">{booking.services?.name || "Training"}</CardTitle>
                      <CardDescription>
                        {booking.time_slots?.start_time
                          ? `${new Date(booking.time_slots.start_time).toLocaleDateString()} at ${new Date(
                              booking.time_slots.start_time
                            ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                          : "Date/time TBA"}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={booking.status === "confirmed" ? "default" : "secondary"}
                      className={
                        booking.status === "confirmed"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }
                    >
                      {booking.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardFooter>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleCancelClick(booking)}
                    disabled={cancellingId === booking.id}
                  >
                    <XCircle className="h-4 w-4" />
                    {cancellingId === booking.id ? "Cancelling..." : "Cancel booking"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Cancel modal */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-2">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <CardTitle className="text-center">Cancel booking?</CardTitle>
              <CardDescription className="text-center">
                Are you sure you want to cancel <strong>{selectedBooking.services?.name}</strong> on{" "}
                {selectedBooking.time_slots?.start_time
                  ? new Date(selectedBooking.time_slots.start_time).toLocaleDateString()
                  : "this date"}
                ? This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedBooking(null);
                }}
              >
                Keep booking
              </Button>
              <Button
                variant="primary"
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleCancelConfirm}
                disabled={cancellingId !== null}
              >
                {cancellingId ? "Cancelling..." : "Yes, cancel"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
      </div>
    </>
  );
}
