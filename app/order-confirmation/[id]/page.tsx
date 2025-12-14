import { createServerSupabaseClient } from "@/lib/supabase-server";
import Link from "next/link";
import { notFound } from "next/navigation";

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

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

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
    .select(`
      *,
      products (
        name,
        image_url
      )
    `)
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
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            Order Confirmation
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Success Message */}
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-900 dark:bg-green-950">
          <div className="flex items-center">
            <svg
              className="h-8 w-8 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-green-900 dark:text-green-100">
                Order Placed Successfully!
              </h2>
              <p className="mt-1 text-sm text-green-800 dark:text-green-200">
                Thank you for your order. We'll send you a confirmation email shortly.
              </p>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-lg font-semibold text-black dark:text-white">
            Order Details
          </h3>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">Order ID:</span>
              <span className="font-mono text-black dark:text-white">
                {order.id.slice(0, 8)}...
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">Order Date:</span>
              <span className="text-black dark:text-white">
                {new Date(order.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">Status:</span>
              <span className="capitalize text-black dark:text-white">
                {order.status}
              </span>
            </div>
            <div className="flex justify-between border-t border-zinc-200 pt-2 dark:border-zinc-800">
              <span className="font-semibold text-zinc-600 dark:text-zinc-400">
                Total:
              </span>
              <span className="text-lg font-bold text-black dark:text-white">
                ${order.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-lg font-semibold text-black dark:text-white">
            Items Ordered
          </h3>
          <div className="mt-4 space-y-4">
            {orderItems.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded bg-zinc-100 dark:bg-zinc-800">
                  {item.products.image_url ? (
                    <img
                      src={item.products.image_url}
                      alt={item.products.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-zinc-400">
                      <svg
                        className="h-8 w-8"
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
                  <p className="font-medium text-black dark:text-white">
                    {item.products.name}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Quantity: {item.quantity} × ${item.price.toFixed(2)}
                  </p>
                  <p className="mt-1 font-semibold text-black dark:text-white">
                    ${(item.quantity * item.price).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Address */}
        {shippingAddress && (
          <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-lg font-semibold text-black dark:text-white">
              Shipping Address
            </h3>
            <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              <p className="font-medium text-black dark:text-white">
                {shippingAddress.name}
              </p>
              <p>{shippingAddress.line1}</p>
              {shippingAddress.line2 && <p>{shippingAddress.line2}</p>}
              <p>
                {shippingAddress.city}, {shippingAddress.state}{" "}
                {shippingAddress.postal_code}
              </p>
              <p>{shippingAddress.country}</p>
              <p className="mt-2">{shippingAddress.email}</p>
              <p>{shippingAddress.phone}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/dashboard"
            className="flex-1 rounded-full bg-black py-3 text-center text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            View My Orders
          </Link>
          <Link
            href="/store"
            className="flex-1 rounded-full border border-zinc-300 bg-white py-3 text-center text-sm font-medium text-black transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    </div>
  );
}
