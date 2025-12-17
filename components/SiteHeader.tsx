"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useCart } from "@/components/store/CartContext";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Training", href: "/trainings" },
  { label: "Make & Take", href: "/make-and-take" },
  { label: "Why choose us", href: "/why-choose-us" },
  { label: "Store", href: "/store" },
  { label: "Book Training", href: "/book", variant: "accent" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export function SiteHeader() {
  const { getTotalItems } = useCart();
  const count = getTotalItems();
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

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
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
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
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className={`site-header ${isAdmin ? "site-header--admin" : ""}`}>
      <div className="site-header__inner">
        <Link href="/" className="site-logo">
          <div className="site-logo__mark">
            <img src="/panhandle-logo.png" alt="Panhandle Pathways" />
          </div>
          {!isAdmin && <span>Panhandle Pathways Teacher Training Center LLC</span>}
        </Link>
        {!isAdmin && (
          <nav className="site-nav" aria-label="Primary">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`site-nav__link${link.variant === "accent" ? " site-nav__link--accent" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
        {!isAdmin && (
          <div className="site-header__actions">
            <Link href="/cart" className="site-nav__link site-nav__cart">
              <span className="site-nav__icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h7.72a2 2 0 0 0 2-1.61L21 6H6" />
                </svg>
              </span>
              <span>Cart</span>
              {count > 0 ? <span className="site-nav__badge">{count > 99 ? "99+" : count}</span> : null}
            </Link>
            <div className="site-nav__auth site-nav__auth--compact">
              {authReady ? (
                userEmail ? (
                  <>
                    {userRole === "admin" ? (
                      isAdmin ? (
                        <Link href="/" className="btn-ghost btn-ghost--compact">
                          View site
                        </Link>
                      ) : (
                        <Link href="/admin" className="btn-ghost btn-ghost--compact">
                          Admin
                        </Link>
                      )
                    ) : null}
                    <Link href="/dashboard" className="btn-ghost btn-ghost--compact">
                      Account
                    </Link>
                  </>
                ) : (
                  <Link href="/auth/login" className="btn-ghost btn-ghost--compact">
                    Sign in
                  </Link>
                )
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
