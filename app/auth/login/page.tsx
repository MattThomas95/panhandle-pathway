"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout - please check your connection")), 10000)
      );

      const loginPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });

      const { data, error } = await Promise.race([loginPromise, timeoutPromise]) as any;

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

      console.log("Login successful, user:", data.user.id);

      // Fetch user profile to determine redirect
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, is_org_admin, organization_id")
        .eq("id", data.user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        // Default to dashboard if profile fetch fails
        setLoading(false);
        router.push("/dashboard");
        return;
      }

      console.log("Profile fetched:", profile);

      // Determine redirect based on role and organization
      let redirectTo: string;

      // Check if there's a specific redirect requested
      const requestedRedirect = searchParams.get("redirectedFrom");

      if (requestedRedirect) {
        // If they were trying to access a specific page, send them there
        redirectTo = requestedRedirect;
      } else {
        // Otherwise, redirect based on role
        if (profile.role === "admin") {
          // System admins go to admin panel
          redirectTo = "/admin";
        } else if (profile.is_org_admin && profile.organization_id) {
          // Organization admins go to org portal
          redirectTo = "/org";
        } else {
          // Regular users go to dashboard
          redirectTo = "/dashboard";
        }
      }

      console.log("Redirecting to:", redirectTo);
      console.log("Waiting 2 seconds before redirect to allow session to persist...");

      // Wait a moment to ensure session is fully persisted to localStorage
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log("Now redirecting...");

      // Use window.location.href instead of router.push to ensure cookies are sent
      // This forces a full page reload which includes the session cookies
      window.location.href = redirectTo;
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "An error occurred during login");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="mb-6 text-center text-2xl font-bold text-black dark:text-white">
          Sign In
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-black shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-white dark:focus:ring-white"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-black shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-white dark:focus:ring-white"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-black py-2 text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Don't have an account?{" "}
          <Link
            href="/auth/signup"
            className="font-medium text-black hover:underline dark:text-white"
          >
            Sign up
          </Link>
        </p>

        <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
          <Link
            href="/auth/forgot-password"
            className="font-medium text-black hover:underline dark:text-white"
          >
            Forgot your password?
          </Link>
        </p>

        <div className="mt-6 border-t border-zinc-200 pt-4 dark:border-zinc-700">
          <Link
            href="/"
            className="block text-center text-sm text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
