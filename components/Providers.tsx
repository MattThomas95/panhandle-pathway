"use client";

import { CartProvider } from "@/components/store/CartContext";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteSettingsProvider } from "@/lib/site-settings";

const isMaintenanceMode =
  process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SiteSettingsProvider>
      <CartProvider>
        {!isMaintenanceMode && <SiteHeader />}
        <main className="site-main relative z-10">{children}</main>
        {!isMaintenanceMode && <SiteFooter />}
      </CartProvider>
    </SiteSettingsProvider>
  );
}
