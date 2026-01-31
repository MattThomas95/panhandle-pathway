import * as React from "react";
import { cn } from "@/lib/utils";

interface CTASectionProps {
  variant?: "primary" | "warm" | "subtle";
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function CTASection({
  variant = "primary",
  eyebrow,
  title,
  description,
  children,
  className,
}: CTASectionProps) {
  const variants: Record<string, string> = {
    primary:
      "bg-gradient-to-br from-[var(--blue-900)] via-[var(--blue-800)] to-[var(--blue-700)] text-white",
    warm:
      "bg-gradient-to-br from-[var(--gold-400)] via-[var(--gold-300)] to-[var(--gold-200)] text-[var(--blue-900)]",
    subtle:
      "bg-gradient-to-br from-[var(--blue-50)] to-[var(--teal-50)] text-[var(--blue-900)]",
  };

  return (
    <section
      className={cn(
        "rounded-3xl p-10 md:p-14",
        variants[variant],
        className
      )}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="max-w-xl">
          {eyebrow && (
            <p
              className={cn(
                "text-xs font-bold uppercase tracking-widest mb-3",
                variant === "primary" ? "text-[var(--teal-300)]" : "text-[var(--blue-600)]"
              )}
            >
              {eyebrow}
            </p>
          )}
          <h2
            className={cn(
              "mb-2",
              variant === "primary" && "text-white"
            )}
          >
            {title}
          </h2>
          {description && (
            <p className={cn(
              "text-base leading-relaxed",
              variant === "primary" ? "text-white/80" : "text-[var(--foreground-muted)]"
            )}>
              {description}
            </p>
          )}
        </div>
        {children && (
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
