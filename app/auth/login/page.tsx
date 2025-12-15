"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export const dynamic = 'force-dynamic';
import { supabase } from "@/lib/supabase";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [redirectPath, setRedirectPath] = useState("/dashboard");

  useEffect(() => {
    const requestedRedirect = searchParams?.get("redirectedFrom");
    setRedirectPath(requestedRedirect || "/dashboard");
  }, [searchParams]);

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
    <div className="auth-layout">
      <div className="auth-card">
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to manage your bookings and programs.</p>

        <form onSubmit={handleLogin} className="auth-form">
          {error && <div className="auth-alert auth-alert-error">{error}</div>}

          <label className="auth-label">
            Email
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input"
              placeholder="you@example.com"
            />
          </label>

          <label className="auth-label">
            Password
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="auth-input"
              placeholder="Your password"
            />
          </label>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%" }}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="auth-links">
          <p>
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="link">
              Sign up
            </Link>
          </p>
          <p>
            <Link href="/auth/forgot-password" className="link">
              Forgot your password?
            </Link>
          </p>
          <p>
            <Link href="/" className="link">
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="auth-layout"><div className="auth-card"><p>Loading...</p></div></div>}>
      <LoginForm />
    </Suspense>
  );
}
