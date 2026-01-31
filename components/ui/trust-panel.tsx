"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Shield, Lock, Eye } from "lucide-react";

interface TrustPanelProps {
  className?: string;
  variant?: "inline" | "card";
}

export function TrustPanel({ className, variant = "inline" }: TrustPanelProps) {
  const [expanded, setExpanded] = React.useState(false);

  const items = [
    {
      icon: Shield,
      title: "Secure connections",
      text: "All bank and payment connections are handled securely through Stripe. We never see or store your sensitive credentials.",
    },
    {
      icon: Lock,
      title: "Your data stays private",
      text: "We do not store bank logins, full account numbers, or sensitive financial details. Your information is never sold or shared.",
    },
    {
      icon: Eye,
      title: "Transparent & safe",
      text: "You can review and manage your payment methods at any time. We only use your information to process your orders.",
    },
  ];

  if (variant === "inline") {
    return (
      <div className={cn("rounded-2xl bg-[var(--teal-50)] border border-[var(--teal-200)] p-4", className)}>
        <div className="flex items-center gap-2 mb-1">
          <Shield className="h-4 w-4 text-[var(--teal-600)]" />
          <span className="text-sm font-bold text-[var(--teal-700)]">
            Your data stays private
          </span>
        </div>
        <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">
          We don&apos;t store bank logins or sensitive details. Connections are handled securely through Stripe.
        </p>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-bold text-[var(--teal-600)] mt-2 hover:underline cursor-pointer"
        >
          {expanded ? "Show less" : "Learn more"}
        </button>
        {expanded && (
          <div className="mt-3 space-y-3 animate-fade-in">
            {items.map((item) => (
              <div key={item.title} className="flex items-start gap-2.5">
                <item.icon className="h-4 w-4 text-[var(--teal-500)] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-[var(--foreground)]">{item.title}</p>
                  <p className="text-xs text-[var(--foreground-muted)]">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl bg-white border border-[var(--border)] p-6 space-y-4", className)}>
      <div className="flex items-center gap-2 mb-2">
        <div className="rounded-lg bg-[var(--teal-50)] p-2">
          <Shield className="h-5 w-5 text-[var(--teal-600)]" />
        </div>
        <h4 className="text-base font-bold">Your privacy matters</h4>
      </div>
      {items.map((item) => (
        <div key={item.title} className="flex items-start gap-3">
          <item.icon className="h-4 w-4 text-[var(--teal-500)] mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold text-[var(--foreground)]">{item.title}</p>
            <p className="text-sm text-[var(--foreground-muted)]">{item.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
