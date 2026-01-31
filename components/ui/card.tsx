import * as React from "react";
import { cn } from "@/lib/utils";

/* ── Card shell ── */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "highlight" | "bordered" | "elevated";
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants: Record<string, string> = {
      default:
        "bg-white border border-[var(--border)] rounded-2xl shadow-sm transition-all duration-300 ease-out hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-1 hover:border-[var(--blue-200)]",
      glass:
        "bg-white/85 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg shadow-black/5 transition-all duration-300 ease-out hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 hover:bg-white/90",
      highlight:
        "bg-gradient-to-br from-[var(--blue-50)] via-white to-[var(--gold-50)]/30 border border-[var(--blue-200)] rounded-2xl shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:shadow-blue-500/15 hover:-translate-y-1.5 hover:scale-[1.01]",
      bordered:
        "bg-white border-2 border-[var(--border)] rounded-2xl transition-all duration-300 ease-out hover:border-[var(--blue-400)] hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-0.5",
      elevated:
        "bg-white rounded-2xl shadow-xl shadow-black/5 transition-all duration-300 ease-out hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 hover:scale-[1.01]",
    };
    return (
      <div
        ref={ref}
        className={cn(variants[variant], className)}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pb-2", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-xl font-semibold leading-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-[var(--foreground-muted)] text-sm mt-1.5", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-3", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-3 p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
