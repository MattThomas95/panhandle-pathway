"use client";

import { CartProvider } from "@/components/store/CartContext";
import { WalkthroughProvider } from "@/components/walkthrough/WalkthroughProvider";
import { WalkthroughPanel } from "@/components/walkthrough/WalkthroughPanel";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FloatingEmojis, SparkleStars, GradientOrbs } from "@/components/ui/floating-elements";

const isMaintenanceMode =
  process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <WalkthroughProvider>
        {/* 🌴 Global floating beach & education decorations */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <GradientOrbs />
          <SparkleStars count={35} color="rgba(255, 204, 0, 0.6)" />
          <FloatingEmojis
            emojis={["🌴", "☀️", "🌊", "🎓", "📚", "✨", "🐚", "🌺", "⭐", "🦋", "🌈", "💛"]}
            count={12}
          />
        </div>

        {!isMaintenanceMode && <SiteHeader />}
        <main className="site-main relative z-10">{children}</main>
        {!isMaintenanceMode && <SiteFooter />}
        {!isMaintenanceMode && <WalkthroughPanel />}
      </WalkthroughProvider>
    </CartProvider>
  );
}
