"use client";

import { useState } from "react";
import { useCart } from "./CartContext";

type AddToCartButtonProps = {
  productId: string;
  productName: string;
  price: number;
  imageUrl: string | null;
  inventory: number;
};

export function AddToCartButton({
  productId,
  productName,
  price,
  imageUrl,
  inventory,
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    setIsAdding(true);

    // Add to cart
    addItem({
      productId,
      productName,
      price,
      imageUrl,
      quantity,
    });

    // Simulate async action for UX
    setTimeout(() => {
      setIsAdding(false);
      // Reset quantity to 1 after adding
      setQuantity(1);
    }, 500);
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, Math.min(inventory, quantity + delta));
    setQuantity(newQuantity);
  };

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Quantity
        </label>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            -
          </button>
          <span className="text-xl font-semibold text-black dark:text-white w-12 text-center">
            {quantity}
          </span>
          <button
            onClick={() => handleQuantityChange(1)}
            disabled={quantity >= inventory}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            +
          </button>
        </div>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={inventory === 0 || isAdding}
        className="w-full rounded-full bg-black py-4 text-lg font-medium text-white transition-all hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        {isAdding ? (
          <span className="flex items-center justify-center">
            <svg
              className="mr-2 h-5 w-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Adding...
          </span>
        ) : inventory === 0 ? (
          "Out of Stock"
        ) : (
          "Add to Cart"
        )}
      </button>

      {/* Total Price Display */}
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            Subtotal
          </span>
          <span className="text-xl font-bold text-black dark:text-white">
            ${(price * quantity).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
