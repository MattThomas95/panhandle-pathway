/* eslint-disable @next/next/no-img-element */
import { createServerSupabaseClient } from "@/lib/supabase-server";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  inventory: number;
  image_url: string | null;
  is_active: boolean;
};

async function getProducts(): Promise<Product[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return data || [];
}

export default async function StorePage() {
  const products = await getProducts();

  return (
    <main className="page">
      <header className="hero" style={{ marginBottom: 32 }}>
        <div className="hero__text">
          <span className="badge badge-blue">Programs & Resources</span>
          <h1>Shop training programs and materials</h1>
          <p>
            Enroll in CDA, director certification, and leadership workshops with trusted resources.
          </p>
          <div className="hero__cta">
            <Link className="btn-primary" href="/book">
              Book a consult
            </Link>
            <Link className="btn-gold" href="/cart">
              View cart
            </Link>
          </div>
        </div>
        <div className="hero__image">
          <div className="hero__image-placeholder">
            <span>Replace with program imagery</span>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="section__header">
          <p className="eyebrow">Catalog</p>
          <h2>Available programs</h2>
          <p className="section__lede">Online and hybrid options with upcoming cohorts.</p>
        </div>

        {products.length === 0 ? (
          <div className="card" style={{ textAlign: "center" }}>
            <p>No products available yet.</p>
          </div>
        ) : (
          <div className="grid-cards">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/store/${product.id}`}
                className="card card--bordered"
                style={{ display: "block" }}
              >
                <div className="aspect-square hero__image" style={{ marginBottom: 16 }}>
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div className="hero__image-placeholder" style={{ minHeight: 180 }}>
                      <span>No image</span>
                    </div>
                  )}
                </div>
                <h3>{product.name}</h3>
                {product.description && <p className="section__lede">{product.description}</p>}
                <div className="card__footer">
                  <span className="badge badge-gold">${product.price.toFixed(2)}</span>
                  <span
                    className="pill"
                    style={{
                      background: product.inventory > 0 ? "rgba(46,163,217,0.12)" : "rgba(240,64,64,0.12)",
                      color: product.inventory > 0 ? "var(--blue-primary)" : "#b91c1c",
                    }}
                  >
                    {product.inventory > 0 ? "In stock" : "Out of stock"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
