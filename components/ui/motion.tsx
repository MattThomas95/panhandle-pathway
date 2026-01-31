"use client";

import { motion, HTMLMotionProps, Variants } from "framer-motion";
import { forwardRef, ReactNode } from "react";

// ─────────────────────────────────────────────────────────
// SPRING CONFIGS - Natural, bouncy motion
// ─────────────────────────────────────────────────────────

export const spring = {
  gentle: { type: "spring", stiffness: 120, damping: 14 },
  bouncy: { type: "spring", stiffness: 300, damping: 15 },
  snappy: { type: "spring", stiffness: 400, damping: 25 },
  wobbly: { type: "spring", stiffness: 180, damping: 12 },
} as const;

export const ease = {
  smooth: [0.4, 0, 0.2, 1],
  snappy: [0.4, 0, 0, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
} as const;

// ─────────────────────────────────────────────────────────
// ANIMATION VARIANTS
// ─────────────────────────────────────────────────────────

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...spring.gentle }
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: ease.smooth }
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { ...spring.bouncy }
  },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { ...spring.gentle }
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { ...spring.gentle }
  },
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { ...spring.wobbly }
  },
};

// Stagger children container
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

// Card hover effect
export const cardHover = {
  rest: {
    scale: 1,
    y: 0,
    transition: { ...spring.snappy }
  },
  hover: {
    scale: 1.02,
    y: -4,
    transition: { ...spring.bouncy }
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 }
  },
};

// Button hover effect
export const buttonHover = {
  rest: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: { ...spring.bouncy }
  },
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 }
  },
};

// Icon bounce
export const iconBounce = {
  rest: { rotate: 0, scale: 1 },
  hover: {
    rotate: [0, -10, 10, -5, 5, 0],
    scale: 1.1,
    transition: { duration: 0.5 }
  },
};

// Float animation for decorative elements
export const float: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Pulse glow effect
export const pulseGlow: Variants = {
  animate: {
    boxShadow: [
      "0 0 0 0 rgba(42, 145, 255, 0)",
      "0 0 0 8px rgba(42, 145, 255, 0.2)",
      "0 0 0 0 rgba(42, 145, 255, 0)",
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// ─────────────────────────────────────────────────────────
// MOTION COMPONENTS
// ─────────────────────────────────────────────────────────

interface MotionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

// Fade in up on scroll
export function FadeInUp({ children, className, delay = 0 }: MotionProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={fadeInUp}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Scale in on scroll
export function ScaleIn({ children, className, delay = 0 }: MotionProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={scaleIn}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Stagger children on scroll
export function StaggerContainer({ children, className }: MotionProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Individual stagger item
export function StaggerItem({ children, className }: Omit<MotionProps, "delay">) {
  return (
    <motion.div variants={fadeInUp} className={className}>
      {children}
    </motion.div>
  );
}

// Interactive card with hover effects
interface MotionCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  enableHover?: boolean;
}

export const MotionCard = forwardRef<HTMLDivElement, MotionCardProps>(
  ({ children, className, enableHover = true, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial="rest"
        whileHover={enableHover ? "hover" : undefined}
        whileTap={enableHover ? "tap" : undefined}
        variants={cardHover}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
MotionCard.displayName = "MotionCard";

// Interactive button wrapper
interface MotionButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
  className?: string;
}

export const MotionButton = forwardRef<HTMLButtonElement, MotionButtonProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        variants={buttonHover}
        className={className}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
MotionButton.displayName = "MotionButton";

// Floating decorative element
export function FloatingElement({ children, className }: MotionProps) {
  return (
    <motion.div
      variants={float}
      animate="animate"
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Page transition wrapper
export function PageTransition({ children, className }: MotionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ ...spring.gentle }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Number counter animation
interface CounterProps {
  from?: number;
  to: number;
  duration?: number;
  className?: string;
  formatter?: (value: number) => string;
}

export function Counter({
  from = 0,
  to,
  duration = 2,
  className,
  formatter = (v) => Math.round(v).toString()
}: CounterProps) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        {formatter(to)}
      </motion.span>
    </motion.span>
  );
}

// Animated gradient background
export function AnimatedGradient({ className }: { className?: string }) {
  return (
    <motion.div
      className={`absolute inset-0 -z-10 ${className || ""}`}
      animate={{
        background: [
          "radial-gradient(circle at 20% 50%, rgba(42, 145, 255, 0.15) 0%, transparent 50%)",
          "radial-gradient(circle at 80% 50%, rgba(242, 183, 5, 0.15) 0%, transparent 50%)",
          "radial-gradient(circle at 50% 80%, rgba(45, 212, 191, 0.15) 0%, transparent 50%)",
          "radial-gradient(circle at 20% 50%, rgba(42, 145, 255, 0.15) 0%, transparent 50%)",
        ],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}

// Re-export motion for custom usage
export { motion };
