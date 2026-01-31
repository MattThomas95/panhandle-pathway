"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// ─────────────────────────────────────────────────────────
// FLOATING EMOJIS
// ─────────────────────────────────────────────────────────

interface FloatingEmojiProps {
  emojis?: string[];
  count?: number;
  className?: string;
}

export function FloatingEmojis({
  emojis = ["✨", "🌟", "⭐", "💫", "🎓", "📚", "🎨", "❤️", "🌈", "🦋"],
  count = 12,
  className = "",
}: FloatingEmojiProps) {
  const [particles, setParticles] = useState<Array<{
    id: number;
    emoji: string;
    x: number;
    y: number;
    size: number;
    duration: number;
    delay: number;
  }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 16 + Math.random() * 24,
      duration: 15 + Math.random() * 20,
      delay: Math.random() * 10,
    }));
    setParticles(newParticles);
  }, [count, emojis]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute select-none"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            fontSize: particle.size,
          }}
          animate={{
            y: [0, -30, 0, 20, 0],
            x: [0, 15, -15, 10, 0],
            rotate: [0, 10, -10, 5, 0],
            scale: [1, 1.1, 0.9, 1.05, 1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {particle.emoji}
        </motion.div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SPARKLE STARS
// ─────────────────────────────────────────────────────────

interface SparkleStarsProps {
  count?: number;
  className?: string;
  color?: string;
}

export function SparkleStars({
  count = 20,
  className = "",
  color = "rgba(255, 215, 0, 0.8)",
}: SparkleStarsProps) {
  const [stars, setStars] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    duration: number;
    delay: number;
  }>>([]);

  useEffect(() => {
    const newStars = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 4 + Math.random() * 8,
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 3,
    }));
    setStars(newStars);
  }, [count]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <svg viewBox="0 0 24 24" fill={color}>
            <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// GRADIENT ORB BACKGROUND
// ─────────────────────────────────────────────────────────

interface GradientOrbsProps {
  className?: string;
}

export function GradientOrbs({ className = "" }: GradientOrbsProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* 🌊 Ocean blue orb */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(26,133,199,0.25) 0%, rgba(38,186,186,0.1) 50%, transparent 70%)",
          filter: "blur(50px)",
        }}
        animate={{
          x: ["-20%", "10%", "-20%"],
          y: ["-10%", "20%", "-10%"],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* ☀️ Sunny golden orb */}
      <motion.div
        className="absolute right-0 w-[450px] h-[450px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,204,0,0.3) 0%, rgba(255,176,0,0.15) 50%, transparent 70%)",
          filter: "blur(50px)",
        }}
        animate={{
          x: ["20%", "-10%", "20%"],
          y: ["10%", "-20%", "10%"],
          scale: [1.1, 0.9, 1.1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* 🌴 Palm green orb */}
      <motion.div
        className="absolute bottom-0 left-1/3 w-[300px] h-[300px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(76,175,80,0.2) 0%, rgba(76,175,80,0.05) 50%, transparent 70%)",
          filter: "blur(40px)",
        }}
        animate={{
          x: ["-10%", "30%", "-10%"],
          y: ["20%", "-10%", "20%"],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* 🐚 Sandy warm orb */}
      <motion.div
        className="absolute top-1/2 right-1/4 w-[250px] h-[250px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(245,232,197,0.4) 0%, rgba(255,204,0,0.1) 50%, transparent 60%)",
          filter: "blur(30px)",
        }}
        animate={{
          x: ["0%", "-20%", "20%", "0%"],
          y: ["0%", "30%", "-20%", "0%"],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* 🌺 Extra sunset orb */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-[180px] h-[180px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,112,67,0.15) 0%, transparent 60%)",
          filter: "blur(30px)",
        }}
        animate={{
          x: ["0%", "25%", "-15%", "0%"],
          y: ["0%", "-20%", "25%", "0%"],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// CONFETTI BURST
// ─────────────────────────────────────────────────────────

interface ConfettiProps {
  isActive?: boolean;
  count?: number;
}

export function ConfettiBurst({ isActive = true, count = 50 }: ConfettiProps) {
  // 🌴 Beach-themed confetti colors
  const colors = ["#1a85c7", "#ffcc00", "#00a8a8", "#ff7043", "#4caf50", "#f5e8c5"];

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-50">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-sm"
          style={{
            left: "50%",
            top: "50%",
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: (Math.random() - 0.5) * window.innerWidth,
            y: (Math.random() - 0.5) * window.innerHeight,
            opacity: 0,
            scale: 0,
            rotate: Math.random() * 720 - 360,
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// ANIMATED BACKGROUND WRAPPER
// ─────────────────────────────────────────────────────────

interface AnimatedBackgroundProps {
  children: React.ReactNode;
  variant?: "sparkle" | "warm" | "ocean" | "aurora" | "sunset";
  showEmojis?: boolean;
  showStars?: boolean;
  className?: string;
}

export function AnimatedBackground({
  children,
  variant = "sparkle",
  showEmojis = false,
  showStars = true,
  className = "",
}: AnimatedBackgroundProps) {
  const gradients = {
    sparkle: "bg-gradient-to-br from-blue-50/80 via-white to-amber-50/60",
    warm: "bg-gradient-to-br from-amber-50/80 via-orange-50/50 to-rose-50/60",
    ocean: "bg-gradient-to-br from-cyan-50/80 via-blue-50/60 to-teal-50/60",
    aurora: "bg-gradient-to-br from-purple-50/80 via-blue-50/60 to-teal-50/60",
    sunset: "bg-gradient-to-br from-orange-50/80 via-rose-50/60 to-purple-50/60",
  };

  const emojiSets = {
    sparkle: ["✨", "🌟", "⭐", "💫", "🎓", "📚"],
    warm: ["🌻", "☀️", "🔥", "🧡", "🌅", "✨"],
    ocean: ["🌊", "🐳", "💙", "🦋", "💎", "✨"],
    aurora: ["🦄", "💜", "🌈", "✨", "💫", "🌙"],
    sunset: ["🌅", "🌸", "🧡", "💜", "✨", "🦋"],
  };

  return (
    <div className={`relative min-h-screen ${gradients[variant]} ${className}`}>
      <GradientOrbs />
      {showStars && <SparkleStars count={25} />}
      {showEmojis && <FloatingEmojis emojis={emojiSets[variant]} count={10} />}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SECTION SPARKLE BACKGROUND
// ─────────────────────────────────────────────────────────

interface SectionSparkleProps {
  children: React.ReactNode;
  className?: string;
  intensity?: "light" | "medium" | "heavy";
}

export function SectionSparkle({
  children,
  className = "",
  intensity = "medium",
}: SectionSparkleProps) {
  const starCounts = { light: 10, medium: 20, heavy: 35 };

  return (
    <div className={`relative ${className}`}>
      <SparkleStars count={starCounts[intensity]} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
