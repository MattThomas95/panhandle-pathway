"use client";
/* eslint-disable @next/next/no-img-element */

import { useCart } from "@/components/store/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  ShoppingBag,
  Package,
  Truck,
} from "lucide-react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    router.push("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="page-container">
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          description="Add a program or resource to get started. Browse our training catalog to find the right fit for you."
        >
          <Button variant="primary" size="lg" asChild>
            <Link href="/store">
              <ShoppingBag className="h-5 w-5" />
              Browse programs
            </Link>
          </Button>
        </EmptyState>
      </div>
    );
  }

  const subtotal = getTotalPrice();
  const shipping = subtotal >= 50 ? 0 : 5;
  const total = subtotal + shipping;

  return (
    <div className="page-container">
      <PageHeader
        badge="Cart"
        title={`Shopping cart (${getTotalItems()} ${getTotalItems() === 1 ? "item" : "items"})`}
        description="Review your items before checkout."
      />

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.productId} variant="default" className="p-4">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[var(--blue-50)] to-[var(--teal-50)] overflow-hidden shrink-0">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-6 w-6 text-[var(--primary)] opacity-30" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <Link
                        href={`/store/${item.productId}`}
                        className="font-bold text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
                      >
                        {item.productName}
                      </Link>
                      <p className="text-sm text-[var(--foreground-muted)] mt-0.5">
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>
                    <p className="font-extrabold text-[var(--blue-900)] whitespace-nowrap">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="h-8 w-8 rounded-lg bg-[var(--border-light)] flex items-center justify-center hover:bg-[var(--blue-50)] transition-colors cursor-pointer"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-10 text-center font-bold text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="h-8 w-8 rounded-lg bg-[var(--border-light)] flex items-center justify-center hover:bg-[var(--blue-50)] transition-colors cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-sm font-bold text-[var(--error)] hover:text-[var(--rose-600)] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Order summary */}
        <Card variant="bordered" className="p-6 sticky top-24">
          <h3 className="text-base mb-4">Order summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--foreground-muted)]">Subtotal</span>
              <span className="font-bold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--foreground-muted)] flex items-center gap-1">
                <Truck className="h-3.5 w-3.5" /> Shipping
              </span>
              <span className="font-bold">
                {shipping === 0 ? (
                  <Badge variant="success">FREE</Badge>
                ) : (
                  `$${shipping.toFixed(2)}`
                )}
              </span>
            </div>
            <div className="border-t border-[var(--border)] pt-3 flex justify-between">
              <span className="font-bold">Total</span>
              <span className="text-lg font-extrabold text-[var(--blue-900)]">${total.toFixed(2)}</span>
            </div>
          </div>

          {subtotal < 50 && (
            <p className="text-xs text-[var(--foreground-muted)] mt-3 bg-[var(--gold-50)] rounded-lg p-2.5">
              Add ${(50 - subtotal).toFixed(2)} more for free shipping.
            </p>
          )}

          <div className="mt-5 space-y-2">
            <Button variant="primary" size="lg" className="w-full" onClick={handleCheckout}>
              Proceed to checkout
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/store">Continue shopping</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
