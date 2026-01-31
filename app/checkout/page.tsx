"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from "react";
import { useCart } from "@/components/store/CartContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseJsClient } from "@/lib/supabase";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stepper } from "@/components/ui/stepper";
import { TrustPanel } from "@/components/ui/trust-panel";
import { PageHeader } from "@/components/ui/page-header";
import {
  ArrowLeft,
  CreditCard,
  Package,
  ShieldCheck,
  Truck,
} from "lucide-react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type ShippingAddress = {
  name: string;
  email: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
};

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCart();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: "",
    email: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "US",
  });

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabaseJsClient.auth.getUser();
      setUser(user);
      if (user?.email) {
        setShippingAddress((prev) => ({ ...prev, email: user.email! }));
      }
    };
    checkUser();
  }, []);

  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
    }
  }, [items, router]);

  const subtotal = getTotalPrice();
  const shipping = subtotal >= 50 ? 0 : 5;
  const total = subtotal + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!user) {
        setError("You must be logged in to place an order");
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items,
          shippingAddress: shippingAddress,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe failed to load");
      }

      const { error: stripeError } = await (stripe as any).redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (stripeError) {
        throw stripeError;
      }

      clearCart();
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err.message || "Failed to process order. Please try again.");
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  const inputClass =
    "w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-[var(--foreground)] shadow-sm focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-colors";
  const labelClass = "block text-sm font-bold text-[var(--foreground)] mb-1.5";

  return (
    <div className="page-container">
      <PageHeader
        badge="Secure checkout"
        badgeVariant="blue"
        title="Complete your order"
        description="Review your items and enter your details to proceed to payment."
      >
        <Button variant="ghost" size="sm" asChild>
          <Link href="/cart">
            <ArrowLeft className="h-4 w-4" />
            Back to cart
          </Link>
        </Button>
      </PageHeader>

      <Stepper
        steps={[
          { label: "Cart", status: "completed" },
          { label: "Details", status: "current" },
          { label: "Payment", status: "upcoming" },
        ]}
        className="mb-8"
      />

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card variant="default" className="p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-base">Contact information</h2>
              <Badge variant="blue">Step 1 of 2</Badge>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="name" className={labelClass}>Full name *</label>
                <input type="text" id="name" name="name" required value={shippingAddress.name} onChange={handleInputChange} className={inputClass} />
              </div>
              <div>
                <label htmlFor="email" className={labelClass}>Email *</label>
                <input type="email" id="email" name="email" required value={shippingAddress.email} onChange={handleInputChange} className={inputClass} />
              </div>
              <div>
                <label htmlFor="phone" className={labelClass}>Phone *</label>
                <input type="tel" id="phone" name="phone" required value={shippingAddress.phone} onChange={handleInputChange} className={inputClass} />
              </div>
            </div>
          </Card>

          {/* Billing Details */}
          <Card variant="default" className="p-6">
            <div className="flex items-center justify-between gap-3 mb-1">
              <h2 className="text-base">Billing details</h2>
              <Badge variant="blue">Step 2 of 2</Badge>
            </div>
            <p className="text-sm text-[var(--foreground-muted)] mb-4">
              Use the address for your receipt and any certification paperwork.
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="line1" className={labelClass}>Address line 1 *</label>
                <input type="text" id="line1" name="line1" required value={shippingAddress.line1} onChange={handleInputChange} className={inputClass} />
              </div>
              <div>
                <label htmlFor="line2" className={labelClass}>Address line 2</label>
                <input type="text" id="line2" name="line2" value={shippingAddress.line2} onChange={handleInputChange} className={inputClass} />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="city" className={labelClass}>City *</label>
                  <input type="text" id="city" name="city" required value={shippingAddress.city} onChange={handleInputChange} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="state" className={labelClass}>State *</label>
                  <input type="text" id="state" name="state" required value={shippingAddress.state} onChange={handleInputChange} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="postal_code" className={labelClass}>ZIP code *</label>
                  <input type="text" id="postal_code" name="postal_code" required value={shippingAddress.postal_code} onChange={handleInputChange} className={inputClass} />
                </div>
              </div>
            </div>
          </Card>

          {/* Trust panel */}
          <TrustPanel variant="inline" />

          {error && (
            <div className="rounded-xl border border-[var(--error)]/20 bg-[var(--rose-50)] p-4 text-sm font-medium text-[var(--error)]">
              {error}
            </div>
          )}

          <Button
            variant="primary"
            size="xl"
            className="w-full"
            onClick={handleSubmit}
            disabled={isLoading || !user}
          >
            <CreditCard className="h-5 w-5" />
            {isLoading ? "Redirecting to Stripe..." : "Continue to payment"}
          </Button>

          {!user && (
            <p className="text-center text-sm text-[var(--foreground-muted)]">
              Please{" "}
              <Link href="/auth/login" className="font-bold text-[var(--primary)] hover:underline">
                log in
              </Link>{" "}
              to place an order.
            </p>
          )}
        </div>

        {/* Order summary sidebar */}
        <Card variant="bordered" className="p-6 sticky top-24">
          <h3 className="text-base mb-4">Order summary</h3>

          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="flex gap-3 rounded-xl bg-[var(--surface)] p-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-[var(--blue-50)] to-[var(--teal-50)]">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package className="h-5 w-5 text-[var(--primary)] opacity-30" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[var(--foreground)] truncate">{item.productName}</p>
                  {item.kind === "booking" && item.startTime ? (
                    <p className="text-xs text-[var(--foreground-muted)]">
                      {new Date(item.startTime).toLocaleDateString()} &middot;{" "}
                      {new Date(item.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  ) : null}
                  <p className="text-xs text-[var(--foreground-muted)]">Qty: {item.quantity}</p>
                  <p className="text-sm font-extrabold text-[var(--blue-900)]">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-2 border-t border-[var(--border)] pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--foreground-muted)]">Subtotal</span>
              <span className="font-bold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--foreground-muted)] flex items-center gap-1">
                <Truck className="h-3.5 w-3.5" /> Shipping
              </span>
              <span className="font-bold">
                {shipping === 0 ? <Badge variant="success">FREE</Badge> : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between border-t border-[var(--border)] pt-3">
              <span className="font-bold">Total</span>
              <span className="text-lg font-extrabold text-[var(--blue-900)]">${total.toFixed(2)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
