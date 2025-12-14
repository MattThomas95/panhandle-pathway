"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/components/store/CartContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseJsClient } from "@/lib/supabase";
import { loadStripe } from "@stripe/stripe-js";

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

      const { error: stripeError } = await stripe.redirectToCheckout({
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f2e7] to-[#fdfbf6] text-slate-900">
      <header className="border-b border-slate-200/70 bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Secure checkout</p>
              <h1 className="text-3xl font-semibold text-[#103b64]">Complete your order</h1>
            </div>
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#1e7fb6] hover:underline"
            >
              ← Back to cart
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-[0_15px_40px_rgba(16,59,100,0.07)]">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-[#103b64]">Contact Information</h2>
                <span className="text-xs rounded-full bg-[#2fa4d9]/10 px-3 py-1 font-medium text-[#2fa4d9]">Step 1 of 2</span>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={shippingAddress.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-[#1e7fb6] focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={shippingAddress.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-[#1e7fb6] focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={shippingAddress.phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-[#1e7fb6] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-[0_15px_40px_rgba(16,59,100,0.07)]">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-[#103b64]">Billing Details</h2>
                <span className="text-xs rounded-full bg-[#2fa4d9]/10 px-3 py-1 font-medium text-[#2fa4d9]">Step 2 of 2</span>
              </div>
              <p className="mt-1 text-sm text-slate-500">Use the address for your receipt and any certification paperwork.</p>
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="line1" className="block text-sm font-medium text-slate-700">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    id="line1"
                    name="line1"
                    required
                    value={shippingAddress.line1}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-[#1e7fb6] focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="line2" className="block text-sm font-medium text-slate-700">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    id="line2"
                    name="line2"
                    value={shippingAddress.line2}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-[#1e7fb6] focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-slate-700">
                      City *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      required
                      value={shippingAddress.city}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-[#1e7fb6] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-slate-700">
                      State *
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      required
                      value={shippingAddress.state}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-[#1e7fb6] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="postal_code" className="block text-sm font-medium text-slate-700">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      id="postal_code"
                      name="postal_code"
                      required
                      value={shippingAddress.postal_code}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-[#1e7fb6] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#2fa4d9]/25 bg-[#eaf6fc] p-4 text-sm text-[#0f4f78] shadow-inner">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#2fa4d9] shadow-sm">
                  ✓
                </span>
                <p>
                  <strong>Secure payment.</strong> You’ll be redirected to Stripe to complete payment with card. Your order is saved when payment succeeds.
                </p>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
                <p className="text-sm font-medium">
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !user}
              className="w-full rounded-full bg-[#2fa4d9] py-4 text-lg font-semibold text-white shadow-lg shadow-[#2fa4d9]/30 transition-all hover:bg-[#1e7fb6] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Redirecting to Stripe..." : "Continue to Payment"}
            </button>

            {!user && (
              <p className="text-center text-sm text-slate-600">
                Please{" "}
                <Link href="/auth/login" className="underline">
                  log in
                </Link>{" "}
                to place an order
              </p>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-4 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-[0_15px_40px_rgba(16,59,100,0.07)]">
              <h2 className="text-lg font-semibold text-[#103b64]">Order Summary</h2>

              <div className="mt-6 space-y-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-3 rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                    <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded bg-slate-100">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-400">
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#0f2f4a]">
                        {item.productName}
                      </p>
                      {item.kind === "booking" && item.startTime ? (
                        <p className="text-xs text-slate-600">
                          {new Date(item.startTime).toLocaleDateString()} ·{" "}
                          {new Date(item.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      ) : null}
                      <p className="text-xs text-slate-600">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold text-[#103b64]">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-2 border-t border-slate-200 pt-4">
                <div className="flex justify-between text-sm text-slate-700">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-700">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-bold text-[#103b64]">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
