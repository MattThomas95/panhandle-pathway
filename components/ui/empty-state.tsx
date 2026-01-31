import * as React from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-6",
        className
      )}
    >
      <div className="rounded-2xl bg-gradient-to-br from-[var(--blue-50)] to-[var(--teal-50)] p-5 mb-6">
        <Icon className="h-10 w-10 text-[var(--primary)]" />
      </div>
      <h3 className="mb-2">{title}</h3>
      <p className="text-[var(--foreground-muted)] max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {children}
    </div>
  );
}
