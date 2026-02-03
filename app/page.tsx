import {
  AnimatedHero,
  AnimatedStatBar,
  AnimatedMission,
  AnimatedPrograms,
  AnimatedWhyUs,
  AnimatedCTA,
} from "@/components/home/AnimatedSections";
import { FloatingEmojis, SparkleStars, GradientOrbs } from "@/components/ui/floating-elements";

export default function Home() {
  return (
    <>
      {/* Floating decorations - only on landing page */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <GradientOrbs />
        <SparkleStars count={35} color="rgba(255, 204, 0, 0.6)" />
        <FloatingEmojis
          emojis={["🌴", "☀️", "🌊", "🎓", "📚", "✨", "🐚", "🌺", "⭐", "🦋", "🌈", "💛"]}
          count={12}
        />
      </div>

      <AnimatedHero />
      <div className="page-container">
        <AnimatedStatBar />
        <AnimatedMission />
        <AnimatedPrograms />
        <AnimatedWhyUs />
        <AnimatedCTA />
      </div>
    </>
  );
}
