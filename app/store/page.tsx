/* eslint-disable @next/next/no-img-element */
import { createServerSupabaseClient } from "@/lib/supabase-server";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ShoppingBag, ShoppingCart, Package } from "lucide-react";

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
    <div className="page-container">
      <PageHeader
        badge="Programs & Resources"
        badgeVariant="blue"
        title="Shop training programs and materials"
        description="Enroll in CDA, director certification, and leadership workshops with trusted resources."
      >
        <Button variant="primary" size="lg" asChild>
          <Link href="/book">
            <ShoppingBag className="h-5 w-5" />
            Book a consult
          </Link>
        </Button>
        <Button variant="secondary" size="lg" asChild>
          <Link href="/cart">
            <ShoppingCart className="h-5 w-5" />
            View cart
          </Link>
        </Button>
      </PageHeader>

      <section>
        <div className="mb-6">
          <Badge variant="default" className="mb-3">Catalog</Badge>
          <h2 className="mb-2">Available programs</h2>
          <p className="text-[var(--foreground-muted)]">Online and hybrid options with upcoming cohorts.</p>
        </div>

        {products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products available yet"
            description="We're preparing our catalog. Check back soon for training programs and materials."
          >
            <Button variant="primary" asChild>
              <Link href="/trainings">View training programs</Link>
            </Button>
          </EmptyState>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {products.map((product) => (
              <Link key={product.id} href={`/store/${product.id}`} className="block group">
                <Card variant="default" className="overflow-hidden animate-fade-in-up h-full flex flex-col">
                  <div className="aspect-[4/3] bg-gradient-to-br from-[var(--blue-50)] to-[var(--teal-50)] overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-[var(--primary)] opacity-30" />
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-base mb-1 group-hover:text-[var(--primary)] transition-colors">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-sm text-[var(--foreground-muted)] line-clamp-2 mb-3 flex-1">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-[var(--border-light)]">
                      <Badge variant="gold">${product.price.toFixed(2)}</Badge>
                      <Badge variant={product.inventory > 0 ? "success" : "error"}>
                        {product.inventory > 0 ? "In stock" : "Out of stock"}
                      </Badge>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
