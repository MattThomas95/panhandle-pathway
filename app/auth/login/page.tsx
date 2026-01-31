"use client";

import { useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export const dynamic = 'force-dynamic';
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GraduationCap, ArrowLeft, AlertCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const redirectPath = useMemo(
    () => searchParams?.get("redirectedFrom") || "/dashboard",
    [searchParams]
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (!data?.user) {
        setError("Login failed. Please try again.");
        setLoading(false);
        return;
      }

      router.push(redirectPath);
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--blue-50)] to-[var(--background)] flex items-center justify-center p-6">
      <Card variant="elevated" className="w-full max-w-md p-8 text-center">
        <div className="rounded-2xl bg-gradient-to-br from-[var(--blue-50)] to-[var(--teal-50)] p-4 w-fit mx-auto mb-5">
          <GraduationCap className="h-8 w-8 text-[var(--primary)]" />
        </div>
        <h1 className="text-2xl mb-1">Welcome back</h1>
        <p className="text-sm text-[var(--foreground-muted)] mb-6">
          Sign in to manage your bookings and programs.
        </p>

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--error-light)] border border-[var(--rose-100)] text-sm font-bold text-[var(--error)]">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <label className="block">
            <span className="text-sm font-bold text-[var(--foreground)] mb-1.5 block">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--blue-200)] focus:border-[var(--primary)] transition-all"
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-[var(--foreground)] mb-1.5 block">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--blue-200)] focus:border-[var(--primary)] transition-all"
              placeholder="Your password"
            />
          </label>

          <Button type="submit" disabled={loading} variant="primary" size="lg" className="w-full">
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="mt-6 space-y-2 text-sm text-[var(--foreground-muted)]">
          <p>
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="font-bold text-[var(--primary)] hover:underline">Sign up</Link>
          </p>
          <p>
            <Link href="/auth/forgot-password" className="font-bold text-[var(--primary)] hover:underline">Forgot your password?</Link>
          </p>
          <p className="pt-2">
            <Link href="/" className="inline-flex items-center gap-1 font-bold text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to home
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-[var(--blue-50)] to-[var(--background)] flex items-center justify-center">
          <div className="animate-pulse-soft text-[var(--foreground-muted)]">Loading...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
