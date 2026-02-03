"use client";

import Link from "next/link";
import { useCart } from "@/components/store/CartContext";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  BookOpen,
  Scissors,
  Star,
  ShoppingBag,
  CalendarCheck,
  HelpCircle,
  Mail,
  ShoppingCart,
  User,
  Settings,
  Globe,
  Menu,
  X,
} from "lucide-react";

const primaryNavLinks = [
  { label: "Trainings", href: "/trainings", icon: BookOpen },
  { label: "CDA Training", href: "/cda", icon: GraduationCap },
  { label: "Make & Take", href: "/make-and-take", icon: Scissors },
  { label: "Why Us", href: "/why-choose-us", icon: Star },
  { label: "Store", href: "/store", icon: ShoppingBag },
  { label: "Book Training", href: "/book", icon: CalendarCheck, accent: true },
];

const utilityLinks = [
  { label: "FAQ", href: "/faq", icon: HelpCircle },
  { label: "Contact", href: "/contact", icon: Mail },
];

export function SiteHeader() {
  const { getTotalItems } = useCart();
  const count = getTotalItems();
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (mounted) {
        setUserEmail(data.session?.user?.email ?? null);
        setAuthReady(true);
        if (data.session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", data.session.user.id)
            .single();
          if (mounted) {
            setUserRole(profile?.role ?? null);
          }
        } else {
          setUserRole(null);
        }
      }
    };
    loadUser();
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) {
          setUserEmail(session?.user?.email ?? null);
          setAuthReady(true);
          if (session?.user) {
            supabase
              .from("profiles")
              .select("role")
              .eq("id", session.user.id)
              .single()
              .then(({ data }) => {
                if (mounted) setUserRole(data?.role ?? null);
              });
          } else {
            setUserRole(null);
          }
        }
      }
    );
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (isAdmin) {
    return (
      <div className="site-header site-header--admin">
        <div className="site-header__shell">
          <div className="site-header__inner site-header__inner--main">
            <Link href="/" className="flex items-center gap-3 font-extrabold text-[var(--blue-900)]">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-white shadow-sm flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/panhandle-logo.png" alt="" className="w-full h-full object-contain" />
              </div>
              <span className="text-sm">Admin Panel</span>
            </Link>
            <div className="flex items-center gap-2">
              {authReady && userEmail && (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/"><Globe className="h-4 w-4 mr-1" /> View Site</Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard"><User className="h-4 w-4 mr-1" /> Account</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="site-header">
      <div className="site-header__shell">
        <div className="site-header__inner site-header__inner--main">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-white shadow-[var(--shadow-sm)] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/panhandle-logo.png" alt="Panhandle Pathways" className="w-full h-full object-contain" />
            </div>
            <div className="hidden sm:block">
              <span className="font-extrabold text-[var(--blue-900)] text-sm leading-tight block">
                Panhandle Pathways
              </span>
              <span className="text-xs text-[var(--foreground-muted)] leading-tight">
                Teacher Training Center
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-3" aria-label="Primary">
            {primaryNavLinks.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + "/");
              if (link.accent) {
                return (
                  <Button key={link.label} variant="primary" size="sm" asChild>
                    <Link href={link.href}>
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  </Button>
                );
              }
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-all duration-150 ${
                    active
                      ? "bg-[var(--blue-50)] text-[var(--primary)]"
                      : "text-[var(--foreground)] hover:bg-[var(--blue-50)] hover:text-[var(--primary)]"
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {utilityLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--blue-50)] transition-all"
              >
                <link.icon className="h-3.5 w-3.5" />
                {link.label}
              </Link>
            ))}

            <Link
              href="/cart"
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold text-[var(--foreground)] hover:bg-[var(--blue-50)] hover:text-[var(--primary)] transition-all"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Cart</span>
              {count > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-[var(--gold-400)] to-[var(--gold-300)] text-[var(--blue-900)] text-[11px] font-extrabold flex items-center justify-center shadow-[var(--shadow-glow-gold)]">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </Link>

            {authReady ? (
              userEmail ? (
                <div className="flex items-center gap-1.5">
                  {userRole === "admin" && (
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/admin"><Settings className="h-4 w-4" /></Link>
                    </Button>
                  )}
                  <Button variant="secondary" size="sm" asChild>
                    <Link href="/dashboard">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">Account</span>
                    </Link>
                  </Button>
                </div>
              ) : (
                <Button variant="secondary" size="sm" asChild>
                  <Link href="/auth/login">Sign in</Link>
                </Button>
              )
            ) : (
              <div className="w-16 h-9 rounded-lg bg-[var(--border-light)] animate-pulse-soft" />
            )}

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-[var(--blue-50)] transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-[var(--border)] bg-white animate-fade-in">
            <nav className="max-w-[1200px] mx-auto p-4 space-y-1">
              {primaryNavLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      active
                        ? "bg-[var(--blue-50)] text-[var(--primary)]"
                        : "text-[var(--foreground)] hover:bg-[var(--blue-50)]"
                    } ${link.accent ? "bg-gradient-to-r from-[var(--blue-600)] to-[var(--blue-500)] text-white hover:shadow-lg" : ""}`}
                  >
                    <link.icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                );
              })}
              <div className="border-t border-[var(--border)] mt-3 pt-3">
                {utilityLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-[var(--foreground-muted)] hover:bg-[var(--blue-50)]"
                  >
                    <link.icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
