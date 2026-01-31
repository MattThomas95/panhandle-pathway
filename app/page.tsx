import {
  AnimatedHero,
  AnimatedStatBar,
  AnimatedMission,
  AnimatedPrograms,
  AnimatedWhyUs,
  AnimatedCTA,
} from "@/components/home/AnimatedSections";

export default function Home() {
  return (
    <>
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
