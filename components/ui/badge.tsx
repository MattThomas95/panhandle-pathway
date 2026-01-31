import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[var(--blue-50)] text-[var(--blue-700)]",
        gold: "bg-gradient-to-r from-[var(--gold-400)] to-[var(--gold-300)] text-[var(--blue-900)]",
        blue: "bg-gradient-to-r from-[var(--blue-500)] to-[var(--blue-600)] text-white",
        teal: "bg-[var(--teal-100)] text-[var(--teal-700)]",
        outline: "border border-[var(--border)] text-[var(--foreground-muted)]",
        success: "bg-[var(--success-light)] text-[var(--success)]",
        warning: "bg-[var(--warning-light)] text-[var(--gold-700)]",
        error: "bg-[var(--error-light)] text-[var(--error)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
