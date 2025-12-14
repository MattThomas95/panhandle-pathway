import { createServerSupabaseClient } from "@/lib/supabase-server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/store/AddToCartButton";
import { CartIcon } from "@/components/store/CartIcon";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  inventory: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
};

async function getProduct(id: string): Promise<Product | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single();

  if (error) {
    console.error("Error fetching product:", error);
    return null;
  }

  return data;
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);

  if (!product || !product.is_active) {
    notFound();
  }

  return (
    <main className="page">
      <header className="section__header" style={{ marginBottom: 24 }}>
        <p className="eyebrow">Program detail</p>
        <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between", flexWrap: "wrap" }}>
          <div>
            <h1>{product.name}</h1>
            <p className="section__lede">Online and hybrid options with hands-on support.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <CartIcon />
            <Link className="link" href="/store">
              Back to catalog
            </Link>
          </div>
        </div>
      </header>

      <div className="grid-cards" style={{ marginTop: 0 }}>
        <article className="card" style={{ gridColumn: "span 1", minHeight: 320 }}>
          <div className="hero__image" style={{ minHeight: 320 }}>
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div className="hero__image-placeholder">
                <span>Drop program photo here</span>
              </div>
            )}
          </div>
        </article>

        <article className="card card--bordered" style={{ gridColumn: "span 1" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <h2>{product.name}</h2>
            <span className="badge badge-gold">${product.price.toFixed(2)}</span>
          </div>
          <p className="section__lede" style={{ marginTop: 12 }}>
            {product.description || "No description available."}
          </p>

          <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <span
              className="pill"
              style={{
                background: product.inventory > 0 ? "rgba(46,163,217,0.12)" : "rgba(240,64,64,0.12)",
                color: product.inventory > 0 ? "var(--blue-primary)" : "#b91c1c",
              }}
            >
              {product.inventory > 0 ? `In stock (${product.inventory} available)` : "Out of stock"}
            </span>
          </div>

          <div style={{ marginTop: 24 }}>
            <AddToCartButton
              productId={product.id}
              productName={product.name}
              price={product.price}
              imageUrl={product.image_url}
              inventory={product.inventory}
            />
          </div>
        </article>
      </div>

      <section className="section" style={{ marginTop: 32 }}>
        <div className="grid-cards">
          <div className="card">
            <h3>What you get</h3>
            <ul className="feature-list">
              <li>Self-paced modules plus live coaching</li>
              <li>Downloadable templates and checklists</li>
              <li>Certificate of completion</li>
            </ul>
          </div>
          <div className="card">
            <h3>Delivery format</h3>
            <ul className="feature-list">
              <li>Online / Hybrid</li>
              <li>Flexible pacing for working educators</li>
              <li>Instructor feedback on assignments</li>
            </ul>
          </div>
          <div className="card">
            <h3>Support</h3>
            <ul className="feature-list">
              <li>Email and chat during business hours</li>
              <li>Office hours with instructors</li>
              <li>Job placement guidance</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
