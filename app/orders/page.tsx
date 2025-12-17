"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type OrderBooking = {
  booking: {
    id: string;
    status: string;
    service_id: string | null;
    slot_id: string | null;
    time_slots: { start_time: string; end_time: string } | null;
    services: { name: string } | null;
    user_id: string | null;
  } | null;
};

type OrderRow = {
  id: string;
  total: number;
  status: string;
  stripe_payment_status: string | null;
  created_at: string;
  order_bookings?: OrderBooking[];
};

type ProfileRow = { id: string; full_name: string | null; email: string | null };

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [memberProfiles, setMemberProfiles] = useState<Record<string, ProfileRow>>({});
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth/login?redirectedFrom=/orders");
        return;
      }

      const { data: prof } = await supabase
        .from("profiles")
        .select("id, full_name, email, role")
        .eq("id", session.user.id)
        .single();

      // Fetch orders
      const { data: orderRows, error: ordersError } = await supabase
        .from("orders")
        .select("id, total, status, stripe_payment_status, created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (ordersError) {
        console.error("Failed to fetch orders:", ordersError);
        setFetchError("Unable to load orders right now.");
        setLoading(false);
        return;
      }

      const rows = (orderRows as OrderRow[]) || [];
      let ordersWithBookings: OrderRow[] = rows;

      if (rows.length) {
        const orderIds = rows.map((o) => o.id);
        const { data: obData, error: obError } = await supabase
          .from("order_bookings")
          .select(
            `
            order_id,
            booking:bookings (
              id,
              status,
              service_id,
              slot_id,
              user_id,
              time_slots ( start_time, end_time ),
              services ( name )
            )
          `
          )
          .in("order_id", orderIds);

        if (obError) {
          console.error("Failed to fetch order bookings:", obError);
        } else if (obData) {
          const grouped: Record<string, OrderBooking[]> = {};
          (obData as any).forEach((ob: any) => {
            const key = ob.order_id;
            grouped[key] = grouped[key] || [];
            grouped[key].push({ booking: ob.booking });
          });
          ordersWithBookings = rows.map((o) => ({
            ...o,
            order_bookings: grouped[o.id] || [],
          }));

          // Collect member profile ids for org admins
          const memberIds = new Set<string>();
          Object.values(grouped).forEach((arr) =>
            arr.forEach((ob) => {
              if (ob.booking?.user_id) memberIds.add(ob.booking.user_id);
            })
          );
          if (memberIds.size && prof?.role === "admin") {
            const { data: memberData } = await supabase
              .from("profiles")
              .select("id, full_name, email")
              .in("id", Array.from(memberIds));
            if (memberData) {
              const map: Record<string, ProfileRow> = {};
              memberData.forEach((p) => {
                map[p.id] = p as any;
              });
              setMemberProfiles(map);
            }
          }
        }
      }

      setOrders(ordersWithBookings);
      setFetchError(null);
      setLoading(false);
    };

    init();
  }, [router]);

  const handleCancel = async (orderId: string) => {
    setCancelError(null);
    setCancelSuccess(null);
    setCancelId(orderId);
    try {
      const res = await fetch("/api/orders/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel order");
      }
      setCancelSuccess("Order cancelled");
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled" } : o)));
    } catch (err: any) {
      setCancelError(err.message || "Failed to cancel order");
    } finally {
      setCancelId(null);
    }
  };

  if (loading) {
    return (
      <main className="page" style={{ textAlign: "center" }}>
        <p>Loading orders...</p>
      </main>
    );
  }

  return (
    <main className="page" id="orders">
      <header className="section" style={{ marginBottom: 16 }}>
        <p className="eyebrow">Orders</p>
        <h1>My orders</h1>
        <p className="section__lede">Manage your orders, bookings, and slot details.</p>
        {fetchError ? <p style={{ color: "#b91c1c", fontWeight: 700 }}>{fetchError}</p> : null}
        {cancelError ? <p style={{ color: "#b91c1c", fontWeight: 700 }}>{cancelError}</p> : null}
        {cancelSuccess ? <p style={{ color: "#15803d", fontWeight: 700 }}>{cancelSuccess}</p> : null}
      </header>

      <section className="grid-cards">
        {orders.length === 0 ? (
          <div className="card">
            <p className="section__lede">No orders yet.</p>
            <Link className="btn-primary" href="/store" style={{ marginTop: 12 }}>
              Browse programs
            </Link>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} id={order.id} className="card card--bordered">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <div>
                  <h3>Order {order.id}</h3>
                  <p className="section__lede">
                    ${order.total.toFixed(2)} · {new Date(order.created_at).toLocaleDateString()}
                  </p>
                  <p className="section__lede">
                    Status: {order.status} {order.stripe_payment_status ? `(${order.stripe_payment_status})` : ""}
                  </p>
                </div>
                <button
                  onClick={() => handleCancel(order.id)}
                  disabled={cancelId === order.id || order.status === "cancelled" || order.status === "refunded"}
                  className="btn-ghost"
                  style={{ borderColor: "rgba(220,38,38,0.3)", color: "#b91c1c" }}
                >
                  {cancelId === order.id ? "Cancelling..." : "Cancel"}
                </button>
              </div>

              {order.order_bookings && order.order_bookings.length ? (
                <div style={{ marginTop: 12 }}>
                  <p className="eyebrow">Bookings</p>
                  <div className="grid-cards">
                    {order.order_bookings.map((ob, idx) => {
                      const b = ob.booking;
                      if (!b) return null;
                      const member = b.user_id ? memberProfiles[b.user_id] : null;
                      return (
                        <div key={`${order.id}-${b.id}-${idx}`} className="card">
                          <h4>{b.services?.name || "Booking"}</h4>
                          <p className="section__lede">
                            {b.time_slots?.start_time
                              ? `${new Date(b.time_slots.start_time).toLocaleDateString()} · ${new Date(b.time_slots.start_time).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}`
                              : "Date/time TBA"}
                          </p>
                          <span
                            className="badge"
                            style={{
                              background: b.status === "confirmed" ? "rgba(16,185,129,0.15)" : "rgba(255,196,85,0.25)",
                              color: b.status === "confirmed" ? "#15803d" : "#92400e",
                            }}
                          >
                            {b.status}
                          </span>
                          {member ? (
                            <p className="section__lede" style={{ marginTop: 6 }}>
                              Member: {member.full_name || member.email}
                            </p>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          ))
        )}
      </section>
    </main>
  );
}
