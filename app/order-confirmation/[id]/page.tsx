/* eslint-disable @next/next/no-img-element */
import { createServerSupabaseClient } from "@/lib/supabase-server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { CheckCircle2, Package, ArrowRight, ShoppingBag, MapPin } from "lucide-react";

type Order = {
  id: string;
  status: string;
  total: number;
  shipping_address: any;
  created_at: string;
};

type OrderItem = {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  products: {
    name: string;
    image_url: string | null;
  };
};

async function getOrder(id: string): Promise<Order | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from("orders").select("*").eq("id", id).single();
  if (error) {
    console.error("Error fetching order:", error);
    return null;
  }
  return data;
}

async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("order_items")
    .select(`*, products (name, image_url)`)
    .eq("order_id", orderId);
  if (error) {
    console.error("Error fetching order items:", error);
    return [];
  }
  return data || [];
}

export default async function OrderConfirmationPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await getOrder(params.id);
  const orderItems = await getOrderItems(params.id);

  if (!order) {
    notFound();
  }

  const shippingAddress = order.shipping_address;

  return (
    <div className="page-container">
      {/* Success banner */}
      <Card variant="highlight" className="p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-[var(--teal-50)] p-3">
            <CheckCircle2 className="h-8 w-8 text-[var(--teal-500)]" />
          </div>
          <div>
            <h1 className="mb-1">Order placed successfully!</h1>
            <p className="text-[var(--foreground-muted)]">
              Thank you for your order. We&apos;ll send you a confirmation email shortly.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Order details */}
        <Card variant="default" className="p-6">
          <h3 className="text-base mb-4">Order details</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--foreground-muted)]">Order ID</span>
              <span className="font-mono font-bold">{order.id.slice(0, 8)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--foreground-muted)]">Date</span>
              <span className="font-bold">{new Date(order.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--foreground-muted)]">Status</span>
              <Badge variant="success">{order.status}</Badge>
            </div>
            <div className="flex justify-between border-t border-[var(--border)] pt-3">
              <span className="font-bold">Total</span>
              <span className="text-lg font-extrabold text-[var(--blue-900)]">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* Shipping address */}
        {shippingAddress && (
          <Card variant="default" className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-4 w-4 text-[var(--primary)]" />
              <h3 className="text-base">Shipping address</h3>
            </div>
            <div className="text-sm text-[var(--foreground-muted)] space-y-1">
              <p className="font-bold text-[var(--foreground)]">{shippingAddress.name}</p>
              <p>{shippingAddress.line1}</p>
              {shippingAddress.line2 && <p>{shippingAddress.line2}</p>}
              <p>
                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postal_code}
              </p>
              <p>{shippingAddress.country}</p>
              <p className="mt-2">{shippingAddress.email}</p>
              <p>{shippingAddress.phone}</p>
            </div>
          </Card>
        )}
      </div>

      {/* Items */}
      <Card variant="default" className="p-6 mb-8">
        <h3 className="text-base mb-4">Items ordered</h3>
        <div className="space-y-4">
          {orderItems.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[var(--blue-50)] to-[var(--teal-50)]">
                {item.products.image_url ? (
                  <img src={item.products.image_url} alt={item.products.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Package className="h-6 w-6 text-[var(--primary)] opacity-30" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-bold text-[var(--foreground)]">{item.products.name}</p>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Quantity: {item.quantity} &times; ${item.price.toFixed(2)}
                </p>
                <p className="font-extrabold text-[var(--blue-900)] mt-1">
                  ${(item.quantity * item.price).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="primary" size="lg" asChild>
          <Link href="/dashboard">
            View my orders
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button variant="secondary" size="lg" asChild>
          <Link href="/store">
            <ShoppingBag className="h-4 w-4" />
            Continue shopping
          </Link>
        </Button>
      </div>
    </div>
  );
}
