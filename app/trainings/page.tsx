import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CTASection } from "@/components/ui/cta-section";
import {
  Users,
  Lightbulb,
  Puzzle,
  Calendar,
  CheckCircle2,
  BookOpen,
  GraduationCap,
  Heart,
  Target,
  Sparkles,
} from "lucide-react";

const trainingTargets = [
  "Relationship-based, Instructor-led, Outcome-focused SESSIONS",
  "Ongoing professional development for early childhood educators",
  "Intentional teaching practices based on theory and research",
  "Enhanced teacher-child interactions focusing on existing principles",
  "Elevated coaching and support enhancing classroom practices",
  "Improved use of assessment data to augment teaching strategies and enrich child outcomes",
];

const instructionalFormats = [
  {
    icon: Users,
    title: "Symposiums",
    badge: "4 & 2 Hour Workshops",
    badgeVariant: "gold" as const,
    description:
      "Symposiums highlight meaningful \"topic-based\" trainings, featuring multiple speakers that address content from diverse perspectives resulting in participant's development of practical application and definable outcome.",
  },
  {
    icon: Lightbulb,
    title: "Seminars",
    badge: "4 & 2 Hour Workshops",
    badgeVariant: "blue" as const,
    description:
      "Seminars include research-based instructional strategies targeting implementation of specialized outcomes.",
  },
  {
    icon: Puzzle,
    title: "Sessions",
    badge: "4 & 2 Hour Workshops",
    badgeVariant: "default" as const,
    description:
      "Sessions include intensive analysis of targeted topics using hands-on activities that promote full participation, resulting in enhanced practical classroom application.",
  },
];

export default function TrainingsPage() {
  return (
    <div className="page-container">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <div className="flex justify-center mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/panhandle-logo-enhanced-final.png"
            alt="Panhandle Pathways"
            className="h-24 w-auto object-contain"
          />
        </div>
        <Badge variant="blue" className="mb-4">Professional Teacher Development</Badge>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
          <span className="text-[var(--foreground)]">Re</span>
          <span className="text-[var(--primary)]">TURN</span>
          <span className="text-[var(--foreground)]"> to </span>
          <span className="text-[var(--primary)]">FUN</span>
          <span className="text-[var(--foreground)]">damentals</span>
        </h1>
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <Button variant="primary" size="lg" asChild>
            <Link href="/book">
              <Calendar className="h-5 w-5" />
              Book Training
            </Link>
          </Button>
          <Button variant="secondary" size="lg" asChild>
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </section>

      {/* Introduction */}
      <section className="mb-12 max-w-4xl mx-auto">
        <Card variant="default" className="p-8">
          <p className="text-[var(--foreground-muted)] leading-relaxed mb-4">
            Panhandle Pathways Teacher Academy (PPTA) recognizes that traditional training methods
            often seem like one more &quot;thing&quot; you must do.
          </p>
          <p className="text-[var(--foreground-muted)] leading-relaxed mb-4">
            That is why PPTA is dedicated to ensuring that relationship-based training engages the
            heart, mind, and essence of the early childhood teacher.
          </p>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--blue-50)] border border-[var(--blue-200)]">
            <Heart className="h-5 w-5 text-[var(--primary)] mt-0.5 shrink-0" />
            <p className="text-[var(--foreground)] leading-relaxed">
              PPTA&apos;s purpose is to promote a{" "}
              <em className="text-[var(--primary)] font-semibold">ReTURN to Early Childhood FUNdamentals</em>{" "}
              where play-based teaching strategies and intentional classroom practices create calm from chaos
              while preparing children for school success and a life-long love of learning.
            </p>
          </div>
        </Card>
      </section>

      {/* Training Targets */}
      <section className="mb-12">
        <Card className="p-8 border-2 border-[var(--gold-400)] bg-gradient-to-br from-[var(--gold-50)] to-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-xl bg-[var(--gold-100)] p-2.5">
              <Target className="h-6 w-6 text-[var(--gold-500)]" />
            </div>
            <h2 className="text-xl md:text-2xl">
              <span className="text-[var(--foreground)]">Re</span>
              <span className="text-[var(--primary)]">TURN</span>
              <span className="text-[var(--foreground)]"> to </span>
              <span className="text-[var(--primary)]">FUN</span>
              <span className="text-[var(--foreground)]">damentals Training Experiences </span>
              <span className="text-[var(--gold-500)]">TARGET...</span>
            </h2>
          </div>
          <ul className="space-y-3">
            {trainingTargets.map((target) => (
              <li key={target} className="flex items-start gap-3 text-[var(--foreground-muted)]">
                <CheckCircle2 className="h-5 w-5 text-[var(--teal-500)] mt-0.5 shrink-0" />
                <span className="leading-relaxed">{target}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* In-Person Teaching Formats */}
      <section className="mb-12">
        <div className="rounded-2xl bg-gradient-to-br from-[var(--blue-100)] to-[var(--blue-50)] p-8 md:p-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl mb-2">
              <span className="text-[var(--foreground)]">Re</span>
              <span className="text-[var(--primary)]">TURN</span>
              <span className="text-[var(--foreground)]"> to </span>
              <span className="text-[var(--primary)]">FUN</span>
              <span className="text-[var(--foreground)]">damentals </span>
              <span className="text-[var(--blue-600)]">IN-PERSON</span>
              <span className="text-[var(--foreground)]"> Teaching Formats</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 stagger-children">
            {instructionalFormats.map((format) => (
              <Card key={format.title} variant="default" className="flex flex-col animate-fade-in-up">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="rounded-xl bg-[var(--blue-50)] p-2.5">
                      <format.icon className="h-5 w-5 text-[var(--primary)]" />
                    </div>
                    <Badge variant={format.badgeVariant}>{format.badge}</Badge>
                  </div>
                  <CardTitle className="mt-3">*{format.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <CardDescription className="leading-relaxed text-sm">
                    {format.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional programs */}
      <section className="mb-12">
        <div className="text-center mb-8">
          <Badge variant="default" className="mb-3">
            <Sparkles className="h-3 w-3 mr-1" />
            Explore Our Programs
          </Badge>
          <h2 className="mb-2">Start Your Professional Journey</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Card variant="default" className="p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-[var(--gold-100)] p-2.5 shrink-0">
                <GraduationCap className="h-5 w-5 text-[var(--gold-500)]" />
              </div>
              <div>
                <Badge variant="gold" className="mb-2">National CDA</Badge>
                <h4 className="mb-2">Child Development Associate</h4>
                <p className="text-sm text-[var(--foreground-muted)] mb-4">
                  Prepare for your CDA credential with our comprehensive training program
                  covering Infant/Toddler, Preschool, and Birth-5 tracks.
                </p>
                <Button variant="primary" size="sm" asChild>
                  <Link href="/cda">Learn More</Link>
                </Button>
              </div>
            </div>
          </Card>
          <Card variant="default" className="p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-[var(--blue-50)] p-2.5 shrink-0">
                <BookOpen className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <div>
                <Badge variant="blue" className="mb-2">Hands-On</Badge>
                <h4 className="mb-2">Make & Take</h4>
                <p className="text-sm text-[var(--foreground-muted)] mb-4">
                  Build real classroom materials with instructor guidance.
                  Take home activities and resources for immediate use.
                </p>
                <Button variant="primary" size="sm" asChild>
                  <Link href="/make-and-take">Learn More</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <CTASection
        variant="subtle"
        eyebrow="Ready to grow?"
        title="Start your professional development journey"
        description="Contact us to learn more about our training programs and find the right fit for your professional development needs."
      >
        <Button variant="primary" size="lg" asChild>
          <Link href="/book">
            <Calendar className="h-5 w-5" />
            Book Training
          </Link>
        </Button>
        <Button variant="secondary" size="lg" asChild>
          <Link href="/contact">Get in Touch</Link>
        </Button>
      </CTASection>
    </div>
  );
}
