import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./card";
import { Badge } from "./badge";
import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon?: LucideIcon;
  iconColor?: string;
  badge?: string;
  badgeVariant?: "default" | "gold" | "blue" | "teal";
  title: string;
  description: string;
  features?: string[];
  footer?: React.ReactNode;
  variant?: "default" | "glass" | "highlight" | "bordered";
  className?: string;
}

export function FeatureCard({
  icon: Icon,
  iconColor = "text-[var(--primary)]",
  badge,
  badgeVariant = "default",
  title,
  description,
  features,
  footer,
  variant = "default",
  className,
}: FeatureCardProps) {
  return (
    <Card variant={variant} className={cn("flex flex-col", className)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className={cn("rounded-xl bg-[var(--blue-50)] p-2.5", iconColor)}>
                <Icon className="h-5 w-5" />
              </div>
            )}
            <CardTitle>{title}</CardTitle>
          </div>
          {badge && <Badge variant={badgeVariant}>{badge}</Badge>}
        </div>
        <CardDescription className={Icon ? "ml-[44px]" : ""}>{description}</CardDescription>
      </CardHeader>
      {features && features.length > 0 && (
        <CardContent className="flex-1">
          <ul className="space-y-2">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-[var(--foreground-muted)]">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--teal-400)] shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </CardContent>
      )}
      {footer && <CardFooter className="mt-auto">{footer}</CardFooter>}
    </Card>
  );
}
