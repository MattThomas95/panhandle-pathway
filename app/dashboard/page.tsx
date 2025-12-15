"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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
      // Fetch the booking to get its slot_id
      const { data: bookingRow, error: fetchErr } = await supabase
        .from("bookings")
        .select("id, slot_id")
        .eq("id", selectedBooking.id)
        .single();

      if (fetchErr) {
        throw fetchErr;
      }

      // Decrement booked_count for the slot, restore availability
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

      // Remove the booking entirely to avoid unique constraint conflicts
      const { error: deleteErr } = await supabase
        .from("bookings")
        .delete()
        .eq("id", selectedBooking.id);

      if (deleteErr) {
        throw deleteErr;
      }

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
      <main className="page" style={{ textAlign: "center" }}>
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="section" style={{ marginBottom: 24 }}>
        <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <div>
            <p className="eyebrow">Account</p>
            <h1 style={{ margin: "4px 0" }}>Hi, {profile?.full_name || user?.email}</h1>
            <p className="section__lede">Manage your bookings, profile, and settings.</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
            {profile?.role === "admin" && (
              <Link className="btn-ghost" href="/admin">
                Admin
              </Link>
            )}
            {profile?.is_org_admin && (
              <Link className="btn-ghost" href="/org">
                Org portal
              </Link>
            )}
            <button onClick={handleSignOut} className="btn-primary">
              Sign out
            </button>
          </div>
        </div>
      </section>

      <section className="grid-cards">
        <div className="card">
          <h2>Your profile</h2>
          <ul className="feature-list">
            <li>
              <strong>Email:</strong> {user?.email}
            </li>
            <li>
              <strong>Name:</strong> {profile?.full_name || "Not set"}
            </li>
            <li>
              <strong>Role:</strong> {profile?.role || "user"}
            </li>
          </ul>
        </div>

        <div className="card">
          <h2>Quick links</h2>
          <div className="feature-list">
            <li>
              <Link className="link" href="/store">
                Visit store
              </Link>
            </li>
            <li>
              <Link className="link" href="/book">
                Book an appointment
              </Link>
            </li>
          </div>
        </div>

        <div className="card">
          <h2>Support</h2>
          <p className="section__lede">Need help? Reach out to support anytime.</p>
          <Link className="btn-primary" href="mailto:support@panhandlepathways.com">
            Email support
          </Link>
        </div>

        <div className="card">
          <h2>Orders</h2>
          <p className="section__lede">Cancel an order and release any associated bookings.</p>
          <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center", flexWrap: "wrap" }}>
            <input
              type="text"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              placeholder="Order ID"
              style={{
                flex: "1 1 180px",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(0,0,0,0.12)",
              }}
            />
            <button
              onClick={handleOrderCancel}
              disabled={orderCancelLoading}
              className="btn-ghost"
              style={{ whiteSpace: "nowrap", minHeight: 40 }}
            >
              {orderCancelLoading ? "Cancelling..." : "Cancel order"}
            </button>
          </div>
          {orderCancelError ? (
            <p style={{ marginTop: 8, color: "#b91c1c", fontWeight: 600 }}>{orderCancelError}</p>
          ) : null}
          {orderCancelMessage ? (
            <p style={{ marginTop: 8, color: "#15803d", fontWeight: 600 }}>{orderCancelMessage}</p>
          ) : null}
        </div>
      </section>

      <section className="section">
        <div className="section__header">
          <p className="eyebrow">Orders</p>
          <h2>Recent orders</h2>
        </div>
        <div className="grid-cards">
          {orders.length === 0 ? (
            <div className="card">
              <p className="section__lede">No orders yet.</p>
            </div>
          ) : (
            orders.slice(0, 3).map((order) => (
              <Link key={order.id} href={`/orders#${order.id}`} className="card card--bordered" style={{ display: "block" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3>Order {order.id}</h3>
                    <p className="section__lede">
                      ${order.total.toFixed(2)} · {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    <p className="section__lede">
                      Status: {order.status} {order.stripe_payment_status ? `(${order.stripe_payment_status})` : ""}
                    </p>
                  </div>
                  <span className="pill">View</span>
                </div>
              </Link>
            ))
          )}
        </div>
        <div style={{ marginTop: 12 }}>
          <Link className="btn-primary" href="/orders">
            View all orders
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="section__header">
          <p className="eyebrow">Bookings</p>
          <h2>Upcoming bookings</h2>
        </div>
        <div className="grid-cards">
          {bookings.length === 0 ? (
            <div className="card">
              <p className="section__lede">No upcoming bookings.</p>
              <Link className="btn-primary" href="/book" style={{ marginTop: 12 }}>
                Book now
              </Link>
            </div>
          ) : (
            bookings.map((booking) => (
              <div key={booking.id} className="card card--bordered">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3>{booking.services?.name}</h3>
                    <p className="section__lede">
                      {booking.time_slots?.start_time
                        ? `${new Date(booking.time_slots.start_time).toLocaleDateString()} at ${new Date(booking.time_slots.start_time).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}`
                        : "Date/time TBA"}
                    </p>
                    <span
                      className="badge"
                      style={{
                        background: booking.status === "confirmed" ? "rgba(16,185,129,0.15)" : "rgba(255,196,85,0.25)",
                        color: booking.status === "confirmed" ? "#15803d" : "#92400e",
                      }}
                    >
                      {booking.status}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCancelClick(booking)}
                    disabled={cancellingId === booking.id}
                    className="btn-ghost"
                    style={{ borderColor: "rgba(220,38,38,0.3)", color: "#b91c1c" }}
                  >
                    {cancellingId === booking.id ? "Cancelling..." : "Cancel"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card" style={{ maxWidth: 520, width: "100%" }}>
            <h3>Cancel booking?</h3>
            <p className="section__lede">
              Are you sure you want to cancel {selectedBooking.services?.name} on{" "}
              {selectedBooking.time_slots?.start_time
                ? new Date(selectedBooking.time_slots.start_time).toLocaleDateString()
                : "this date"}
              ?
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedBooking(null);
                }}
                className="btn-ghost"
                style={{ flex: 1 }}
              >
                Keep booking
              </button>
              <button
                onClick={handleCancelConfirm}
                disabled={cancellingId !== null}
                className="btn-primary"
                style={{ flex: 1, background: "#dc2626" }}
              >
                {cancellingId ? "Cancelling..." : "Yes, cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
