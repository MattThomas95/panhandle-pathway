import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-bold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer text-sm relative overflow-hidden",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-[var(--blue-500)] to-[var(--blue-400)] text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98] focus-visible:ring-[var(--blue-400)]",
        gold:
          "bg-gradient-to-r from-[var(--gold-400)] via-[var(--gold-300)] to-amber-300 text-[var(--blue-900)] shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/35 hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98] focus-visible:ring-[var(--gold-400)] font-extrabold",
        secondary:
          "bg-white text-[var(--foreground)] border border-[var(--border)] shadow-sm hover:bg-[var(--blue-50)] hover:border-[var(--blue-300)] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-[var(--blue-400)]",
        ghost:
          "text-[var(--foreground-muted)] hover:text-[var(--primary)] hover:bg-[var(--blue-50)] hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-[var(--blue-400)]",
        destructive:
          "bg-gradient-to-r from-[var(--rose-500)] to-[var(--rose-400)] text-white shadow-lg shadow-rose-500/25 hover:shadow-xl hover:shadow-rose-500/35 hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98] focus-visible:ring-[var(--rose-400)]",
        link:
          "text-[var(--primary)] underline-offset-4 hover:underline hover:text-[var(--blue-600)] font-bold p-0 h-auto",
        teal:
          "bg-gradient-to-r from-teal-500 to-cyan-400 text-white shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/35 hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98] focus-visible:ring-teal-400",
      },
      size: {
        sm: "h-9 px-4 text-xs rounded-lg",
        md: "h-11 px-6 text-sm",
        lg: "h-13 px-8 text-base rounded-2xl",
        xl: "h-14 px-10 text-lg rounded-2xl",
        icon: "h-10 w-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
