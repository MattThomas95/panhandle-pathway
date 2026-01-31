import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";

interface PageHeaderProps {
  badge?: string;
  badgeVariant?: "default" | "gold" | "blue" | "teal";
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
  align?: "left" | "center";
}

export function PageHeader({
  badge,
  badgeVariant = "default",
  title,
  description,
  children,
  className,
  align = "left",
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "mb-10",
        align === "center" && "text-center",
        className
      )}
    >
      {badge && (
        <Badge variant={badgeVariant} className="mb-4">
          {badge}
        </Badge>
      )}
      <h1 className="mb-3">{title}</h1>
      <p
        className={cn(
          "text-lg text-[var(--foreground-muted)] max-w-2xl leading-relaxed",
          align === "center" && "mx-auto"
        )}
      >
        {description}
      </p>
      {children && <div className="mt-6 flex flex-wrap gap-3">{children}</div>}
    </header>
  );
}
