import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { CTASection } from "@/components/ui/cta-section";
import {
  GraduationCap,
  CheckCircle2,
  Users,
  Calendar,
  BookOpen,
  Scissors,
  ArrowRight,
} from "lucide-react";

const tracks = [
  {
    name: "Infant/Toddler CDA",
    seats: "10 slots",
    price: "$450",
    priceNote: "standalone $500",
    notes: "Instructor-led weekends (Fri-Sun)",
    icon: "👶",
  },
  {
    name: "Preschool CDA",
    seats: "10 slots",
    price: "$450",
    notes: "Instructor-led weekends (Fri-Sun)",
    icon: "🎨",
  },
  {
    name: "Birth-5 CDA",
    seats: "5 slots",
    price: "$500",
    notes: "Instructor-led weekends (Fri-Sun)",
    icon: "🌟",
  },
];

const whyChoose = [
  "Instructor-led only — no self-paced tracks",
  "Local Florida Panhandle educators with live support",
  "Portfolio and practicum guidance; supported even online",
  "Weekend cadence (Fri-Sun) to fit working teachers",
  "Bring a can-do attitude; we bring the coaching and checklists",
];

export default function CdaPage() {
  return (
    <div className="page-container">
      <PageHeader
        badge="CDA Training"
        badgeVariant="blue"
        title="National CDA — Instructor-led only"
        description="Infant/Toddler, Preschool, and Birth-5 CDA tracks led by instructors. First class is planned for January 23-25 with Friday-Sunday sessions."
      >
        <Button variant="primary" size="lg" asChild>
          <Link href="/book">
            <Calendar className="h-5 w-5" />
            Book training
          </Link>
        </Button>
        <Button variant="secondary" size="lg" asChild>
          <Link href="/contact">Ask a question</Link>
        </Button>
      </PageHeader>

      {/* Why choose us */}
      <Card variant="highlight" className="p-6 mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-xl bg-[var(--blue-50)] p-2.5">
            <GraduationCap className="h-5 w-5 text-[var(--primary)]" />
          </div>
          <h3>Why choose our CDA program?</h3>
        </div>
        <ul className="space-y-3">
          {whyChoose.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-[var(--foreground-muted)]">
              <CheckCircle2 className="h-4 w-4 text-[var(--teal-500)] mt-0.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </Card>

      {/* Tracks */}
      <section className="mb-12">
        <div className="mb-6">
          <Badge variant="default" className="mb-3">Tracks</Badge>
          <h2 className="mb-2">Choose your CDA track</h2>
          <p className="text-[var(--foreground-muted)]">Instructor-led weekends, capped seats, and focused outcomes.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 stagger-children">
          {tracks.map((track) => (
            <Card key={track.name} variant="bordered" className="flex flex-col animate-fade-in-up">
              <CardHeader>
                <p className="text-2xl mb-2">{track.icon}</p>
                <CardTitle>{track.name}</CardTitle>
                <p className="text-sm text-[var(--foreground-muted)] mt-1">{track.notes}</p>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline">
                    <Users className="h-3 w-3 mr-1" />
                    {track.seats}
                  </Badge>
                </div>
                <p className="text-2xl font-extrabold text-[var(--blue-900)]">
                  {track.price}
                  {track.priceNote && (
                    <span className="text-sm font-normal text-[var(--foreground-muted)] ml-2">
                      ({track.priceNote})
                    </span>
                  )}
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="primary" size="sm" className="w-full" asChild>
                  <Link href="/book">Reserve a slot</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Staff Training */}
      <section className="mb-12">
        <div className="mb-6">
          <Badge variant="default" className="mb-3">Staff Training</Badge>
          <h2 className="mb-2">Supported learning for educators</h2>
          <p className="text-[var(--foreground-muted)] max-w-2xl">
            Live, instructor-led sessions plus supported online touchpoints. We focus on practice, compliance, and real classroom readiness.
          </p>
        </div>
        <Card variant="default" className="p-6">
          <ul className="space-y-3">
            {[
              "Weekly instructor check-ins with actionable feedback",
              "Portfolio checkpoints and practicum guidance",
              "Compliance-ready documentation and local context",
              "\"Can do\" expectations: show up prepared to learn and practice",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-[var(--foreground-muted)]">
                <CheckCircle2 className="h-4 w-4 text-[var(--teal-500)] mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* Make & Take */}
      <section className="mb-12">
        <div className="mb-6">
          <Badge variant="default" className="mb-3">Make &amp; Take</Badge>
          <h2 className="mb-2">Hands-on Make &amp; Take training</h2>
          <p className="text-[var(--foreground-muted)] max-w-2xl">
            Practical, classroom-ready materials you can build and take with you — guided by instructors.
          </p>
        </div>
        <Card variant="default" className="p-6">
          <ul className="space-y-3 mb-6">
            {[
              "Instructor-led build sessions tailored to your CDA track",
              "Materials lists provided in advance",
              "Local examples for infant, toddler, and preschool classrooms",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-[var(--foreground-muted)]">
                <Scissors className="h-4 w-4 text-[var(--gold-400)] mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <Button variant="primary" asChild>
            <Link href="/book">
              Book Make &amp; Take
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </Card>
      </section>

      {/* Next steps */}
      <CTASection
        variant="subtle"
        eyebrow="Next steps"
        title="Ready to start your CDA journey?"
        description="Book your first training session and join the next cohort."
      >
        <Button variant="primary" size="lg" asChild>
          <Link href="/book">
            <Calendar className="h-5 w-5" />
            Book Training
          </Link>
        </Button>
      </CTASection>
    </div>
  );
}
