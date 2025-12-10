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
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-black dark:text-white">
              Store
            </h1>
            <Link
              href="/"
              className="text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400">
              No products available yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="group rounded-lg border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="aspect-[3/4] overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-zinc-400">
                      No image
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <h3 className="font-semibold text-black dark:text-white">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {product.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-bold text-black dark:text-white">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.inventory > 0 ? (
                      <span className="text-sm text-green-600 dark:text-green-400">
                        In Stock
                      </span>
                    ) : (
                      <span className="text-sm text-red-600 dark:text-red-400">
                        Out of Stock
                      </span>
                    )}
                  </div>
                  <button
                    className="mt-4 w-full rounded-full bg-black py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                    disabled={product.inventory === 0}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
