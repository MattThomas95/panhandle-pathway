"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface WalkthroughStep {
  id: string;
  title: string;
  description: string;
  action?: string;
  href?: string;
  completed?: boolean;
}

const DEFAULT_STEPS: WalkthroughStep[] = [
  {
    id: "explore-programs",
    title: "Explore training programs",
    description: "Browse our CDA, Director, and Make & Take training tracks to find the right fit for you.",
    action: "View programs",
    href: "/trainings",
  },
  {
    id: "create-account",
    title: "Create your free account",
    description: "Sign up so you can book training sessions and track your progress.",
    action: "Sign up",
    href: "/auth/signup",
  },
  {
    id: "book-training",
    title: "Book your first training",
    description: "Pick a date and time that works for you. Our instructors are ready to help.",
    action: "Book training",
    href: "/book",
  },
  {
    id: "browse-store",
    title: "Check out the store",
    description: "Find study materials, resources, and tools to support your learning journey.",
    action: "Visit store",
    href: "/store",
  },
];

interface WalkthroughContextValue {
  steps: WalkthroughStep[];
  currentStepIndex: number;
  isOpen: boolean;
  isDismissed: boolean;
  isComplete: boolean;
  openWalkthrough: () => void;
  dismissWalkthrough: () => void;
  completeStep: (stepId: string) => void;
  resetWalkthrough: () => void;
  progress: number;
}

const WalkthroughContext = createContext<WalkthroughContextValue | null>(null);

const STORAGE_KEY = "pp-walkthrough";

export function WalkthroughProvider({ children }: { children: React.ReactNode }) {
  const [steps, setSteps] = useState<WalkthroughStep[]>(DEFAULT_STEPS);
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.dismissed) {
          setIsDismissed(true);
        }
        if (data.completedSteps) {
          setSteps((prev) =>
            prev.map((s) => ({
              ...s,
              completed: data.completedSteps.includes(s.id),
            }))
          );
        }
      } else {
        setIsOpen(true);
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  const save = useCallback(
    (completedSteps: string[], dismissed: boolean) => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ completedSteps, dismissed })
        );
      } catch {
        // ignore
      }
    },
    []
  );

  const completedCount = steps.filter((s) => s.completed).length;
  const isComplete = completedCount === steps.length;
  const currentStepIndex = steps.findIndex((s) => !s.completed);
  const progress = Math.round((completedCount / steps.length) * 100);

  const completeStep = useCallback(
    (stepId: string) => {
      setSteps((prev) => {
        const next = prev.map((s) =>
          s.id === stepId ? { ...s, completed: true } : s
        );
        save(
          next.filter((s) => s.completed).map((s) => s.id),
          isDismissed
        );
        return next;
      });
    },
    [isDismissed, save]
  );

  const dismissWalkthrough = useCallback(() => {
    setIsDismissed(true);
    setIsOpen(false);
    save(
      steps.filter((s) => s.completed).map((s) => s.id),
      true
    );
  }, [steps, save]);

  const openWalkthrough = useCallback(() => {
    setIsOpen(true);
    setIsDismissed(false);
    save(
      steps.filter((s) => s.completed).map((s) => s.id),
      false
    );
  }, [steps, save]);

  const resetWalkthrough = useCallback(() => {
    setSteps(DEFAULT_STEPS);
    setIsOpen(true);
    setIsDismissed(false);
    save([], false);
  }, [save]);

  return (
    <WalkthroughContext.Provider
      value={{
        steps,
        currentStepIndex: currentStepIndex === -1 ? steps.length : currentStepIndex,
        isOpen: loaded ? isOpen : false,
        isDismissed: loaded ? isDismissed : true,
        isComplete,
        openWalkthrough,
        dismissWalkthrough,
        completeStep,
        resetWalkthrough,
        progress,
      }}
    >
      {children}
    </WalkthroughContext.Provider>
  );
}

export function useWalkthrough() {
  const ctx = useContext(WalkthroughContext);
  if (!ctx) throw new Error("useWalkthrough must be used within WalkthroughProvider");
  return ctx;
}
