"use client";

import Link from "next/link";
import { useWalkthrough } from "./WalkthroughProvider";
import { Button } from "@/components/ui/button";
import {
  Check,
  ChevronRight,
  Sparkles,
  X,
  RotateCcw,
  PartyPopper,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function WalkthroughPanel() {
  const {
    steps,
    currentStepIndex,
    isOpen,
    isDismissed,
    isComplete,
    dismissWalkthrough,
    openWalkthrough,
    resetWalkthrough,
    progress,
  } = useWalkthrough();

  // Collapsed pill when dismissed
  if (isDismissed && !isComplete) {
    return (
      <div className="fixed bottom-6 right-6 z-40 animate-fade-in-up">
        <button
          onClick={openWalkthrough}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-[var(--blue-600)] to-[var(--blue-500)] text-white text-sm font-bold shadow-[var(--shadow-glow-blue)] hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer"
        >
          <Sparkles className="h-4 w-4" />
          Getting Started
          <span className="bg-white/20 rounded-full px-2 py-0.5 text-xs">
            {progress}%
          </span>
        </button>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 w-[380px] max-w-[calc(100vw-2rem)] animate-fade-in-up">
      <div className="bg-white rounded-2xl shadow-[var(--shadow-xl)] border border-[var(--border)] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[var(--blue-600)] to-[var(--teal-500)] p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <h4 className="text-white font-bold text-base">
                {isComplete ? "You're all set!" : "Getting Started"}
              </h4>
            </div>
            <button
              onClick={dismissWalkthrough}
              className="p-1 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-white/80 mt-2">
            {isComplete
              ? "You've completed all the steps. Welcome aboard!"
              : `${steps.filter((s) => s.completed).length} of ${steps.length} steps complete`}
          </p>
        </div>

        {/* Body */}
        <div className="p-4">
          {isComplete ? (
            <div className="text-center py-4">
              <PartyPopper className="h-10 w-10 text-[var(--gold-400)] mx-auto mb-3" />
              <p className="text-sm text-[var(--foreground-muted)] mb-4">
                You&apos;re ready to start your training journey. We&apos;re excited to have you!
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="primary" size="sm" asChild>
                  <Link href="/book">Book Training</Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={resetWalkthrough}>
                  <RotateCcw className="h-3.5 w-3.5" />
                  Restart
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              {steps.map((step, index) => {
                const isCurrent = index === currentStepIndex;
                return (
                  <div
                    key={step.id}
                    className={cn(
                      "rounded-xl p-3 transition-all duration-200",
                      step.completed && "opacity-60",
                      isCurrent && "bg-[var(--blue-50)] border border-[var(--blue-200)]",
                      !step.completed && !isCurrent && "hover:bg-[var(--border-light)]"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "mt-0.5 h-6 w-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all",
                          step.completed &&
                            "bg-[var(--teal-500)] text-white",
                          isCurrent &&
                            "bg-gradient-to-r from-[var(--blue-600)] to-[var(--blue-500)] text-white shadow-sm",
                          !step.completed &&
                            !isCurrent &&
                            "bg-[var(--border-light)] text-[var(--foreground-subtle)]"
                        )}
                      >
                        {step.completed ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "text-sm font-bold",
                            step.completed && "line-through text-[var(--foreground-muted)]"
                          )}
                        >
                          {step.title}
                        </p>
                        {isCurrent && (
                          <div className="animate-fade-in">
                            <p className="text-xs text-[var(--foreground-muted)] mt-1 leading-relaxed">
                              {step.description}
                            </p>
                            {step.href && (
                              <Button
                                variant="primary"
                                size="sm"
                                className="mt-2.5"
                                asChild
                              >
                                <Link href={step.href}>
                                  {step.action || "Go"}
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </Link>
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
