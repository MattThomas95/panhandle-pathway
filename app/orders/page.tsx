"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ShoppingBag, Loader2, Calendar, User as UserIcon } from "lucide-react";

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
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="page-container" id="orders">
      <PageHeader
        badge="Orders"
        title="My orders"
        description="Manage your orders, bookings, and slot details."
      />

      {fetchError && (
        <div className="rounded-xl border border-[var(--error)]/20 bg-[var(--rose-50)] p-3 text-sm font-bold text-[var(--error)] mb-6">
          {fetchError}
        </div>
      )}
      {cancelError && (
        <div className="rounded-xl border border-[var(--error)]/20 bg-[var(--rose-50)] p-3 text-sm font-bold text-[var(--error)] mb-6">
          {cancelError}
        </div>
      )}
      {cancelSuccess && (
        <div className="rounded-xl border border-[var(--teal-500)]/20 bg-[var(--teal-50)] p-3 text-sm font-bold text-[var(--teal-600)] mb-6">
          {cancelSuccess}
        </div>
      )}

      {orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders yet"
          description="Once you purchase a program or book a training, your orders will appear here."
        >
          <Button variant="primary" asChild>
            <Link href="/store">Browse programs</Link>
          </Button>
        </EmptyState>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} id={order.id} variant="bordered" className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="font-bold text-[var(--foreground)]">Order {order.id.slice(0, 8)}...</p>
                  <p className="text-sm text-[var(--foreground-muted)] mt-1">
                    ${order.total.toFixed(2)} &middot; {new Date(order.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={order.status === "completed" ? "success" : order.status === "cancelled" ? "error" : "default"}>
                      {order.status}
                    </Badge>
                    {order.stripe_payment_status && (
                      <Badge variant="outline">{order.stripe_payment_status}</Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCancel(order.id)}
                  disabled={cancelId === order.id || order.status === "cancelled" || order.status === "refunded"}
                  className="text-[var(--error)] hover:text-[var(--error)] hover:bg-[var(--rose-50)]"
                >
                  {cancelId === order.id ? "Cancelling..." : "Cancel"}
                </Button>
              </div>

              {order.order_bookings && order.order_bookings.length > 0 && (
                <div className="mt-5 pt-4 border-t border-[var(--border-light)]">
                  <Badge variant="default" className="mb-3">Bookings</Badge>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {order.order_bookings.map((ob, idx) => {
                      const b = ob.booking;
                      if (!b) return null;
                      const member = b.user_id ? memberProfiles[b.user_id] : null;
                      return (
                        <Card key={`${order.id}-${b.id}-${idx}`} variant="default" className="p-4">
                          <p className="font-bold text-sm">{b.services?.name || "Booking"}</p>
                          <p className="text-xs text-[var(--foreground-muted)] mt-1 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {b.time_slots?.start_time
                              ? `${new Date(b.time_slots.start_time).toLocaleDateString()} · ${new Date(b.time_slots.start_time).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}`
                              : "Date/time TBA"}
                          </p>
                          <Badge
                            variant={b.status === "confirmed" ? "success" : "warning"}
                            className="mt-2"
                          >
                            {b.status}
                          </Badge>
                          {member && (
                            <p className="text-xs text-[var(--foreground-muted)] mt-2 flex items-center gap-1">
                              <UserIcon className="h-3 w-3" />
                              {member.full_name || member.email}
                            </p>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
