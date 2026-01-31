"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  label: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {steps.map((step, index) => {
        const isComplete = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <React.Fragment key={step.label}>
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shrink-0",
                  isComplete && "bg-[var(--teal-500)] text-white",
                  isCurrent &&
                    "bg-gradient-to-r from-[var(--blue-600)] to-[var(--blue-500)] text-white shadow-[var(--shadow-glow-blue)]",
                  !isComplete &&
                    !isCurrent &&
                    "bg-[var(--border-light)] text-[var(--foreground-subtle)]"
                )}
              >
                {isComplete ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <div className="hidden sm:block">
                <p
                  className={cn(
                    "text-sm font-bold leading-tight",
                    isCurrent ? "text-[var(--foreground)]" : "text-[var(--foreground-muted)]"
                  )}
                >
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-xs text-[var(--foreground-subtle)]">{step.description}</p>
                )}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 rounded-full min-w-[24px]",
                  index < currentStep
                    ? "bg-[var(--teal-400)]"
                    : "bg-[var(--border-light)]"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
