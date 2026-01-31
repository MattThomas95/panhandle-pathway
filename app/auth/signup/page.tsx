"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, ArrowLeft, AlertCircle, CheckCircle2, Mail, Building2 } from "lucide-react";

const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.user && !data.session) {
      setSuccess(true);
    } else {
      router.push("/dashboard");
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--blue-50)] to-[var(--background)] flex items-center justify-center p-6">
        <Card variant="elevated" className="w-full max-w-md p-8 text-center">
          <div className="rounded-2xl bg-[var(--success-light)] p-4 w-fit mx-auto mb-5">
            <CheckCircle2 className="h-8 w-8 text-[var(--success)]" />
          </div>
          <h2 className="mb-2">Check your email</h2>
          <p className="text-sm text-[var(--foreground-muted)] mb-6">
            We&apos;ve sent a confirmation link to <strong>{email}</strong>. Please click the link to verify your account.
          </p>
          <Button variant="primary" asChild>
            <Link href="/auth/login">Back to Sign In</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--blue-50)] to-[var(--background)] flex items-center justify-center p-6">
      <Card variant="elevated" className="w-full max-w-md p-8 text-center">
        <div className="rounded-2xl bg-gradient-to-br from-[var(--blue-50)] to-[var(--teal-50)] p-4 w-fit mx-auto mb-5">
          <GraduationCap className="h-8 w-8 text-[var(--primary)]" />
        </div>
        <h1 className="text-2xl mb-1">Create an account</h1>
        <p className="text-sm text-[var(--foreground-muted)] mb-6">
          Join Panhandle Pathways and start your training journey.
        </p>

        <form onSubmit={handleSignup} className="space-y-4 text-left">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--error-light)] border border-[var(--rose-100)] text-sm font-bold text-[var(--error)]">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <label className="block">
            <span className="text-sm font-bold text-[var(--foreground)] mb-1.5 block">Full Name</span>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--blue-200)] focus:border-[var(--primary)] transition-all"
              placeholder="John Doe"
            />
          </label>

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
              placeholder="At least 6 characters"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-[var(--foreground)] mb-1.5 block">Confirm Password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--blue-200)] focus:border-[var(--primary)] transition-all"
              placeholder="Repeat your password"
            />
          </label>

          <Button type="submit" disabled={loading} variant="primary" size="lg" className="w-full">
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <p className="mt-5 text-sm text-[var(--foreground-muted)]">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-bold text-[var(--primary)] hover:underline">Sign in</Link>
        </p>

        <div className="mt-4 rounded-xl bg-[var(--blue-50)] p-3 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-[var(--primary)] shrink-0" />
          <p className="text-xs text-[var(--primary)]">
            Want to create an organization?{" "}
            <Link href="/auth/create-organization" className="font-bold underline hover:no-underline">Click here</Link>
          </p>
        </div>

        <div className="mt-5 pt-4 border-t border-[var(--border)]">
          <Link href="/" className="inline-flex items-center gap-1 text-sm font-bold text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
          </Link>
        </div>
      </Card>
    </div>
  );
}
