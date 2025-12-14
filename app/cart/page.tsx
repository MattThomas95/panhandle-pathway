"use client";

import { useCart } from "@/components/store/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    router.push("/checkout");
  };

  if (items.length === 0) {
    return (
      <main className="page">
        <header className="section__header">
          <p className="eyebrow">Cart</p>
          <h1>Your cart is empty</h1>
          <p className="section__lede">Add a program or resource to get started.</p>
        </header>
        <div className="card" style={{ textAlign: "center" }}>
          <p>No items yet.</p>
          <Link className="btn-primary" href="/store" style={{ marginTop: 16 }}>
            Browse programs
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <header className="section__header" style={{ marginBottom: 16 }}>
        <p className="eyebrow">Cart</p>
        <h1>Shopping cart ({getTotalItems()} {getTotalItems() === 1 ? "item" : "items"})</h1>
      </header>

      <div className="grid-cards" style={{ alignItems: "start" }}>
        <div className="card" style={{ gridColumn: "span 2" }}>
          {items.map((item) => (
            <div
              key={item.productId}
              style={{ display: "grid", gridTemplateColumns: "96px 1fr", gap: 16, alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(0,0,0,0.05)" }}
            >
              <div className="hero__image" style={{ minHeight: 96, borderRadius: 12 }}>
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.productName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div className="hero__image-placeholder" style={{ minHeight: 96 }}>
                    <span>No image</span>
                  </div>
                )}
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div>
                    <Link className="link" href={`/store/${item.productId}`}>
                      {item.productName}
                    </Link>
                    <p className="section__lede" style={{ marginTop: 4 }}>
                      ${item.price.toFixed(2)} each
                    </p>
                  </div>
                  <div style={{ fontWeight: 700 }}>${(item.price * item.quantity).toFixed(2)}</div>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="btn-primary"
                      style={{ padding: "8px 12px", borderRadius: 8, background: "var(--navy)" }}
                    >
                      -
                    </button>
                    <span style={{ minWidth: 32, textAlign: "center", fontWeight: 700 }}>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="btn-primary"
                      style={{ padding: "8px 12px", borderRadius: 8 }}
                    >
                      +
                    </button>
                  </div>
                  <button onClick={() => removeItem(item.productId)} className="link" style={{ color: "#b91c1c" }}>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="card card--bordered" style={{ gridColumn: "span 1", position: "sticky", top: 24 }}>
          <h2>Order summary</h2>
          <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Subtotal</span>
              <span>${getTotalPrice().toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Shipping</span>
              <span>{getTotalPrice() >= 50 ? "FREE" : "$5.00"}</span>
            </div>
            <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: 10, display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
              <span>Total</span>
              <span>${(getTotalPrice() + (getTotalPrice() >= 50 ? 0 : 5)).toFixed(2)}</span>
            </div>
          </div>

          {getTotalPrice() < 50 && (
            <p className="section__lede" style={{ marginTop: 12 }}>
              Add ${(50 - getTotalPrice()).toFixed(2)} more for free shipping.
            </p>
          )}

          <button onClick={handleCheckout} className="btn-primary" style={{ width: "100%", marginTop: 16 }}>
            Proceed to checkout
          </button>
          <Link className="btn-gold" href="/store" style={{ width: "100%", marginTop: 10, display: "inline-flex", justifyContent: "center" }}>
            Continue shopping
          </Link>
        </aside>
      </div>
    </main>
  );
}
