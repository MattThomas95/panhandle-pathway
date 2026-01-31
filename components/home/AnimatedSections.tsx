"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import {
  GraduationCap,
  BookOpen,
  Scissors,
  Users,
  Calendar,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Star,
  Heart,
  Sparkles,
} from "lucide-react";
import {
  fadeInUp,
  scaleIn,
  staggerContainer,
  spring,
  cardHover,
  FloatingElement,
} from "@/components/ui/motion";
import { FloatingEmojis, SparkleStars } from "@/components/ui/floating-elements";

const stats = [
  { icon: CheckCircle2, label: "Instructor-led", value: "100%" },
  { icon: Calendar, label: "First cohort", value: "Jan 23-25" },
  { icon: MapPin, label: "Region", value: "Florida Panhandle" },
  { icon: Users, label: "Class size", value: "Small groups" },
];

const programs = [
  {
    icon: GraduationCap,
    title: "National CDA Training",
    description:
      "Infant/Toddler, Preschool, and Birth-5 CDA tracks with live instructor-led weekends and guided online support.",
    features: [
      "Live weekend sessions (Fri-Sun)",
      "Practicum guidance & portfolio support",
      "Always instructor-supported",
    ],
    badge: "Most Popular",
    badgeVariant: "gold" as const,
    href: "/cda",
    color: "blue",
  },
  {
    icon: BookOpen,
    title: "Director Certification",
    description:
      "Operations, compliance, staffing, and growth training tailored specifically to Florida Panhandle childcare centers.",
    features: [
      "Focused live cohort sessions",
      "Compliance checklists & playbooks",
      "Designed for center operators",
    ],
    badge: "Professional",
    badgeVariant: "blue" as const,
    href: "/director-training",
    color: "teal",
  },
  {
    icon: Scissors,
    title: "Make & Take Training",
    description:
      "Hands-on sessions where you build real classroom materials with guidance from experienced instructors.",
    features: [
      "Instructor-led builds",
      "Take home what you make",
      "Local examples & materials",
    ],
    badge: "Hands-on",
    badgeVariant: "default" as const,
    href: "/make-and-take",
    color: "gold",
  },
];

const reasons = [
  {
    icon: Star,
    title: "Instructor-led only",
    body: "Live weekends with instructor support between sessions. No self-paced drift, ever.",
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    icon: MapPin,
    title: "Panhandle-focused",
    body: "Built by local directors who know Florida requirements and childcare realities.",
    gradient: "from-teal-500 to-emerald-400",
  },
  {
    icon: Heart,
    title: "Career-changing",
    body: "Portfolio guidance, compliance checklists, and director-readiness coaching that gets results.",
    gradient: "from-amber-500 to-orange-400",
  },
];

export function AnimatedHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[var(--blue-900)] via-[var(--blue-800)] to-[var(--blue-700)]">
      {/* 🌴 Tropical floating emojis in hero */}
      <FloatingEmojis
        emojis={["🌴", "☀️", "🌊", "🎓", "📚", "✨", "🐚", "🦋", "⭐", "🌺", "👶", "🧒"]}
        count={18}
        className="opacity-70"
      />
      <SparkleStars count={50} color="rgba(255, 204, 0, 0.7)" />

      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-cyan-400/25 to-teal-400/25 blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ transform: "translate(25%, -50%)" }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-amber-400/20 to-orange-400/20 blur-3xl"
          animate={{
            x: [0, -20, 0],
            y: [0, 20, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ transform: "translate(-25%, 50%)" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-[300px] h-[300px] rounded-full bg-gradient-to-br from-purple-400/15 to-pink-400/15 blur-3xl"
          animate={{
            x: [0, 40, -30, 0],
            y: [0, -30, 20, 0],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ transform: "translate(-50%, -50%)" }}
        />
      </div>

      <div className="relative max-w-[1200px] mx-auto px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <Badge variant="gold" className="mb-5 animate-pulse-ring">
                <Sparkles className="h-3 w-3 mr-1" />
                Now enrolling for January 2025
              </Badge>
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="text-white text-4xl md:text-5xl leading-tight mb-5"
            >
              Childcare training built for{" "}
              <motion.span
                className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-300 to-amber-300 animate-gradient"
                style={{ backgroundSize: "200% 200%" }}
              >
                real classrooms
              </motion.span>
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="text-white/75 text-lg md:text-xl max-w-lg mb-8 leading-relaxed"
            >
              Live, instructor-led weekends for infant, toddler, and preschool
              teams. No self-paced. No shortcuts. Just real training from real
              Florida Panhandle educators.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-3 mb-8">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={spring.bouncy}
              >
                <Button variant="gold" size="lg" asChild className="shadow-lg shadow-amber-500/25">
                  <Link href="/book">
                    <Calendar className="h-5 w-5" />
                    Book Training
                  </Link>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={spring.bouncy}
              >
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
                  asChild
                >
                  <Link href="/trainings">
                    Explore Programs
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-3">
              {["Instructor-led only", "Local & supported", "First class: Jan 23-25"].map((pill, i) => (
                <motion.span
                  key={pill}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1, ...spring.bouncy }}
                  className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-bold border border-white/10 backdrop-blur-sm"
                >
                  {pill}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50, rotateY: -10 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ delay: 0.3, ...spring.gentle }}
          >
            <motion.div
              whileHover={{ y: -8, rotateY: 5 }}
              transition={spring.bouncy}
              style={{ transformStyle: "preserve-3d" }}
            >
              <Card variant="glass" className="bg-white/95 backdrop-blur-xl p-0 overflow-hidden shadow-2xl">
                <div className="bg-gradient-to-r from-[var(--blue-600)] via-[var(--blue-500)] to-cyan-500 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-1">
                        Live cohorts
                      </p>
                      <h3 className="text-white text-lg">Instructor-led weekends</h3>
                    </div>
                    <FloatingElement>
                      <Badge variant="gold">Jan 23-25</Badge>
                    </FloatingElement>
                  </div>
                </div>
                <CardContent className="p-5">
                  <ul className="space-y-3">
                    {[
                      "Bring a can-do attitude — our instructors bring the structure.",
                      "Friday-Sunday cadence with guided online support between sessions.",
                      "Tracks for Infant/Toddler, Preschool CDA, and Director Training.",
                      "Local team that knows Panhandle classrooms and regulations.",
                    ].map((item, i) => (
                      <motion.li
                        key={item}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + i * 0.1, ...spring.gentle }}
                        className="flex items-start gap-2.5 text-sm text-[var(--foreground-muted)]"
                      >
                        <CheckCircle2 className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0" />
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="p-5 pt-0 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--foreground-subtle)]">Next up</p>
                    <p className="text-sm font-bold text-[var(--foreground)]">Reserve your spot for Jan 23-25</p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    transition={spring.bouncy}
                  >
                    <Button variant="primary" size="sm" asChild className="shadow-lg shadow-blue-500/25">
                      <Link href="/book">Book now</Link>
                    </Button>
                  </motion.div>
                </CardFooter>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export function AnimatedStatBar() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={staggerContainer}
      className="grid grid-cols-2 md:grid-cols-4 gap-4 -mt-8 mb-12 relative z-10"
    >
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          variants={scaleIn}
          whileHover={{ y: -6, scale: 1.03 }}
          transition={spring.bouncy}
        >
          <Card variant="elevated" className="p-4 text-center hover:shadow-xl transition-shadow">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, ...spring.wobbly }}
            >
              <stat.icon className="h-5 w-5 text-[var(--primary)] mx-auto mb-2" />
            </motion.div>
            <motion.p
              className="text-xl font-extrabold text-[var(--blue-900)]"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              {stat.value}
            </motion.p>
            <p className="text-xs font-bold text-[var(--foreground-muted)]">{stat.label}</p>
          </Card>
        </motion.div>
      ))}
    </motion.section>
  );
}

export function AnimatedMission() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={staggerContainer}
      className="mb-16"
    >
      <div className="max-w-2xl">
        <motion.div variants={fadeInUp}>
          <Badge variant="default" className="mb-4">Our Mission</Badge>
        </motion.div>
        <motion.h2 variants={fadeInUp} className="mb-4">
          Preparing the future of child development professionals
        </motion.h2>
        <motion.p
          variants={fadeInUp}
          className="text-[var(--foreground-muted)] text-lg leading-relaxed"
        >
          We are led by veteran early-childhood educators and directors who have built and run
          programs across the Florida Panhandle. Our mission is to train the next wave of infant,
          toddler, preschool, and director talent with structured, instructor-led cohorts and
          real-world coaching.
        </motion.p>
      </div>
    </motion.section>
  );
}

export function AnimatedPrograms() {
  const colorMap = {
    blue: { bg: "bg-blue-50", text: "text-blue-600", shadow: "shadow-blue-500/20" },
    teal: { bg: "bg-teal-50", text: "text-teal-600", shadow: "shadow-teal-500/20" },
    gold: { bg: "bg-amber-50", text: "text-amber-600", shadow: "shadow-amber-500/20" },
  };

  return (
    <section className="mb-16">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="mb-8"
      >
        <motion.div variants={fadeInUp}>
          <Badge variant="default" className="mb-4">Programs</Badge>
        </motion.div>
        <motion.h2 variants={fadeInUp} className="mb-3">
          Built for infant, toddler, and preschool teachers
        </motion.h2>
        <motion.p variants={fadeInUp} className="text-[var(--foreground-muted)] text-lg max-w-2xl">
          Instructor-led, Florida Panhandle-based programs with supported online resources.
        </motion.p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
        className="grid md:grid-cols-3 gap-6"
      >
        {programs.map((program, i) => {
          const colors = colorMap[program.color as keyof typeof colorMap];
          return (
            <motion.div
              key={program.title}
              variants={fadeInUp}
              whileHover="hover"
              initial="rest"
            >
              <motion.div
                variants={cardHover}
                className="h-full"
              >
                <Card variant="default" className={`flex flex-col h-full hover:${colors.shadow}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <motion.div
                        className={`rounded-xl ${colors.bg} p-2.5`}
                        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <program.icon className={`h-5 w-5 ${colors.text}`} />
                      </motion.div>
                      <Badge variant={program.badgeVariant}>{program.badge}</Badge>
                    </div>
                    <CardTitle className="mt-3">{program.title}</CardTitle>
                    <CardDescription>{program.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-2.5">
                      {program.features.map((f, j) => (
                        <motion.li
                          key={f}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + j * 0.1 }}
                          className="flex items-start gap-2 text-sm text-[var(--foreground-muted)]"
                        >
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                          {f}
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="gap-3">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button variant="primary" size="sm" asChild>
                        <Link href={program.href}>View details</Link>
                      </Button>
                    </motion.div>
                    <Button variant="link" size="sm" asChild>
                      <Link href="/book">
                        Book now <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}

export function AnimatedWhyUs() {
  return (
    <section className="mb-16 relative">
      {/* Section sparkles */}
      <SparkleStars count={20} color="rgba(0, 112, 243, 0.4)" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={spring.gentle}
        className="relative rounded-3xl bg-gradient-to-br from-[var(--blue-600)] via-[var(--blue-500)] to-cyan-500 p-8 md:p-12 mb-8 overflow-hidden"
      >
        {/* 🌴 Tropical floating emojis */}
        <FloatingEmojis
          emojis={["⭐", "🏆", "💯", "🎯", "💪", "✨", "🌴", "☀️"]}
          count={10}
          className="opacity-60"
        />

        {/* Animated background shapes */}
        <motion.div
          className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 blur-3xl"
          animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-amber-400/20 blur-3xl"
          animate={{ x: [0, -15, 0], y: [0, 15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-2">Why us</p>
          <h2 className="text-white text-3xl md:text-4xl mb-2">Training that matches the way you work ✨</h2>
        </div>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="grid md:grid-cols-3 gap-6 -mt-16 relative z-10 px-4"
      >
        {reasons.map((reason, i) => (
          <motion.div
            key={reason.title}
            variants={scaleIn}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={spring.bouncy}
          >
            <Card variant="glass" className="p-6 h-full backdrop-blur-xl hover:shadow-xl transition-all">
              <motion.div
                className={`rounded-xl bg-gradient-to-br ${reason.gradient} p-2.5 w-fit mb-3 shadow-lg`}
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <reason.icon className="h-5 w-5 text-white" />
              </motion.div>
              <h3 className="mb-2">{reason.title}</h3>
              <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">{reason.body}</p>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

export function AnimatedCTA() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={spring.gentle}
      className="relative rounded-3xl bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 p-8 md:p-12 overflow-hidden"
    >
      {/* 🌅 Tropical celebration emojis */}
      <FloatingEmojis
        emojis={["🎉", "🌟", "✨", "🎓", "💪", "🌴", "☀️", "🎯", "🐚", "🌺"]}
        count={15}
        className="opacity-75"
      />
      <SparkleStars count={30} color="rgba(255, 255, 255, 0.8)" />

      {/* Animated decorative elements */}
      <motion.div
        className="absolute top-4 right-8 w-20 h-20 rounded-full bg-white/20"
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-8 left-8 w-16 h-16 rounded-xl bg-white/15"
        animate={{ scale: [1, 1.3, 1], rotate: [0, -45, 0] }}
        transition={{ duration: 7, repeat: Infinity }}
      />
      <motion.div
        className="absolute top-1/2 right-1/4 w-12 h-12 rounded-lg bg-white/10"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <div className="relative text-center max-w-2xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs font-bold uppercase tracking-widest text-white/80 mb-3"
        >
          Ready for the first cohort?
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-white text-3xl md:text-4xl mb-3"
        >
          Reserve Jan 23-25 and train with us
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-white/80 text-lg mb-8"
        >
          Instructor-led weekends only. We&apos;ll follow up with details and prep lists.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <motion.div
            whileHover={{ scale: 1.08, y: -3 }}
            whileTap={{ scale: 0.95 }}
            transition={spring.bouncy}
          >
            <Button
              variant="primary"
              size="lg"
              asChild
              className="bg-white text-amber-600 hover:bg-white/90 shadow-xl shadow-black/10"
            >
              <Link href="/book">
                <Calendar className="h-5 w-5" />
                Book a consult
              </Link>
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={spring.bouncy}
          >
            <Button
              variant="secondary"
              size="lg"
              asChild
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              <Link href="/trainings">Browse trainings</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}
