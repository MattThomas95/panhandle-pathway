"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, ArrowLeft, KeyRound } from "lucide-react";

const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card variant="default" className="w-full max-w-md p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--teal-50)]">
            <Mail className="h-7 w-7 text-[var(--teal-500)]" />
          </div>
          <h2 className="mb-2">Check your email</h2>
          <p className="text-[var(--foreground-muted)]">
            We&apos;ve sent a password reset link to <strong className="text-[var(--foreground)]">{email}</strong>.
          </p>
          <Button variant="primary" size="lg" className="mt-6" asChild>
            <Link href="/auth/login">
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card variant="default" className="w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--blue-50)]">
            <KeyRound className="h-7 w-7 text-[var(--primary)]" />
          </div>
          <Badge variant="default" className="mb-3">Password recovery</Badge>
          <h1 className="mb-2">Reset your password</h1>
          <p className="text-[var(--foreground-muted)]">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-[var(--rose-50)] border border-[var(--error)]/20 p-3 text-sm text-[var(--error)] font-medium">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-bold text-[var(--foreground)] mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-[var(--foreground)] shadow-sm focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-[var(--border-light)] text-center">
          <Link
            href="/auth/login"
            className="text-sm font-bold text-[var(--primary)] hover:text-[var(--blue-700)] transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}
