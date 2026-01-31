/* eslint-disable @next/next/no-img-element */
import { createServerSupabaseClient } from "@/lib/supabase-server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/store/AddToCartButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, Package, BookOpen, Headphones } from "lucide-react";

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

  const features = [
    { icon: Package, title: "What you get", items: ["Self-paced modules plus live coaching", "Downloadable templates and checklists", "Certificate of completion"] },
    { icon: BookOpen, title: "Delivery format", items: ["Online / Hybrid", "Flexible pacing for working educators", "Instructor feedback on assignments"] },
    { icon: Headphones, title: "Support", items: ["Email and chat during business hours", "Office hours with instructors", "Job placement guidance"] },
  ];

  return (
    <div className="page-container">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/store">
            <ArrowLeft className="h-4 w-4" />
            Back to catalog
          </Link>
        </Button>
      </div>

      {/* Product grid */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Image */}
        <Card variant="default" className="overflow-hidden">
          <div className="aspect-square bg-gradient-to-br from-[var(--blue-50)] to-[var(--teal-50)]">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-16 w-16 text-[var(--primary)] opacity-20" />
              </div>
            )}
          </div>
        </Card>

        {/* Details */}
        <div>
          <Badge variant="default" className="mb-3">Program detail</Badge>
          <h1 className="mb-3">{product.name}</h1>
          <p className="text-[var(--foreground-muted)] text-lg leading-relaxed mb-6">
            {product.description || "No description available."}
          </p>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-extrabold text-[var(--blue-900)]">
              ${product.price.toFixed(2)}
            </span>
            <Badge variant={product.inventory > 0 ? "success" : "error"}>
              {product.inventory > 0 ? `In stock (${product.inventory} available)` : "Out of stock"}
            </Badge>
          </div>

          <AddToCartButton
            productId={product.id}
            productName={product.name}
            price={product.price}
            imageUrl={product.image_url}
            inventory={product.inventory}
          />
        </div>
      </div>

      {/* Features grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {features.map((section) => (
          <Card key={section.title} variant="default" className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-xl bg-[var(--blue-50)] p-2.5">
                <section.icon className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <h3 className="text-base">{section.title}</h3>
            </div>
            <ul className="space-y-2.5">
              {section.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-[var(--foreground-muted)]">
                  <CheckCircle2 className="h-4 w-4 text-[var(--teal-500)] mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
