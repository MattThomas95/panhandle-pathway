"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stepper } from "@/components/ui/stepper";
import { Building2, ArrowLeft, ArrowRight } from "lucide-react";

const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function CreateOrganizationPage() {
  const router = useRouter();
  const [step, setStep] = useState<"account" | "organization">("account");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [orgEmail, setOrgEmail] = useState("");
  const [orgPhone, setOrgPhone] = useState("");
  const [orgAddress, setOrgAddress] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const inputClass =
    "w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-[var(--foreground)] shadow-sm focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-colors";
  const labelClass = "block text-sm font-bold text-[var(--foreground)] mb-1.5";

  const handleAccountSubmit = async (e: React.FormEvent) => {
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

    setStep("organization");
  };

  const handleOrganizationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .insert({
          name: orgName,
          slug: orgSlug,
          email: orgEmail || null,
          phone: orgPhone || null,
          address: orgAddress || null,
          is_active: true,
        })
        .select()
        .single();

      if (orgError) {
        setError(orgError.message);
        setLoading(false);
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setError("Failed to create account");
        setLoading(false);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 1500));

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          organization_id: orgData.id,
          is_org_admin: true,
          full_name: fullName,
        })
        .eq("id", authData.user.id);

      if (updateError) {
        setError(`Account created but failed to link organization: ${updateError.message}`);
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  const goBack = () => {
    setStep("account");
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card variant="default" className="w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--blue-50)]">
            <Building2 className="h-7 w-7 text-[var(--primary)]" />
          </div>
          <Badge variant="blue" className="mb-3">Organization</Badge>
          <h1 className="mb-2">Create organization</h1>
          <p className="text-[var(--foreground-muted)]">
            {step === "account"
              ? "Step 1: Create your admin account"
              : "Step 2: Set up your organization"}
          </p>
        </div>

        <Stepper
          steps={[
            { label: "Account", status: step === "account" ? "current" : "completed" },
            { label: "Organization", status: step === "organization" ? "current" : "upcoming" },
          ]}
          className="mb-6"
        />

        {step === "account" ? (
          <form onSubmit={handleAccountSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-[var(--rose-50)] border border-[var(--error)]/20 p-3 text-sm text-[var(--error)] font-medium">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="fullName" className={labelClass}>Full name</label>
              <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className={inputClass} placeholder="John Doe" />
            </div>
            <div>
              <label htmlFor="email" className={labelClass}>Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} placeholder="you@example.com" />
            </div>
            <div>
              <label htmlFor="password" className={labelClass}>Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClass} placeholder="Minimum 6 characters" />
            </div>
            <div>
              <label htmlFor="confirmPassword" className={labelClass}>Confirm password</label>
              <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={inputClass} />
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full">
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        ) : (
          <form onSubmit={handleOrganizationSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-[var(--rose-50)] border border-[var(--error)]/20 p-3 text-sm text-[var(--error)] font-medium">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="orgName" className={labelClass}>Organization name</label>
              <input
                id="orgName"
                type="text"
                value={orgName}
                onChange={(e) => {
                  setOrgName(e.target.value);
                  setOrgSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/(^-|-$)/g, "")
                  );
                }}
                required
                className={inputClass}
                placeholder="Acme Corporation"
              />
            </div>
            <div>
              <label htmlFor="orgSlug" className={labelClass}>Organization slug</label>
              <input id="orgSlug" type="text" value={orgSlug} onChange={(e) => setOrgSlug(e.target.value)} required pattern="[a-z0-9-]+" className={inputClass} placeholder="acme-corporation" />
              <p className="mt-1 text-xs text-[var(--foreground-muted)]">URL-friendly identifier (lowercase letters, numbers, hyphens only)</p>
            </div>
            <div>
              <label htmlFor="orgEmail" className={labelClass}>Organization email (optional)</label>
              <input id="orgEmail" type="email" value={orgEmail} onChange={(e) => setOrgEmail(e.target.value)} className={inputClass} placeholder="contact@acme.com" />
            </div>
            <div>
              <label htmlFor="orgPhone" className={labelClass}>Phone (optional)</label>
              <input id="orgPhone" type="tel" value={orgPhone} onChange={(e) => setOrgPhone(e.target.value)} className={inputClass} placeholder="(555) 123-4567" />
            </div>
            <div>
              <label htmlFor="orgAddress" className={labelClass}>Address (optional)</label>
              <textarea id="orgAddress" value={orgAddress} onChange={(e) => setOrgAddress(e.target.value)} rows={3} className={inputClass} placeholder="123 Main St, City, State 12345" />
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="secondary" className="flex-1" onClick={goBack}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button type="submit" variant="primary" className="flex-1" disabled={loading}>
                {loading ? "Creating..." : "Create organization"}
              </Button>
            </div>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-[var(--border-light)] text-center space-y-2">
          <p className="text-sm text-[var(--foreground-muted)]">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-bold text-[var(--primary)] hover:text-[var(--blue-700)] transition-colors">
              Sign in
            </Link>
          </p>
          <Link href="/" className="text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors block">
            Back to home
          </Link>
        </div>
      </Card>
    </div>
  );
}
