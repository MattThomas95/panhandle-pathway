import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/store/CartContext";
import { SiteHeader } from "@/components/SiteHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Panhandle Pathways Teacher Training Center LLC",
  description: "Instructor-led CDA and director training for Florida’s childcare educators.",
};

const maintenanceOn =
  process.env.MAINTENANCE_MODE === "true" ||
  process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${sourceSans.variable} ${playfair.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CartProvider>
          {!maintenanceOn && <SiteHeader />}
          <main className="site-main">{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
