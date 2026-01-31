import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CTASection } from "@/components/ui/cta-section";
import {
  BookOpen,
  CheckCircle2,
  Calendar,
  Users,
  ClipboardList,
  TrendingUp,
  Shield,
  ArrowRight,
} from "lucide-react";

const whyChoose = [
  "Instructor-led only — focused hours for owners and directors",
  "Local Florida Panhandle context, compliance, and staffing guidance",
  "Playbooks for enrollment, staffing, and day-to-day operations",
  "Designed to pair with CDA pathways when needed",
];

const courseModules = [
  { icon: ClipboardList, title: "Operations & compliance", desc: "Checklists and templates" },
  { icon: Users, title: "Staffing & culture", desc: "Hiring, onboarding, retention" },
  { icon: TrendingUp, title: "Growth", desc: "Enrollment, parent communication, budgeting" },
  { icon: Shield, title: "\"Can do\" expectation", desc: "Come prepared to learn and act" },
];

export default function DirectorTrainingPage() {
  return (
    <div className="page-container">
      <PageHeader
        badge="Director Training"
        badgeVariant="blue"
        title="Instructor-led director training for childcare leaders"
        description="Local, instructor-led sessions focused on operations, compliance, staffing, and growth. Fewer hours than CDA, but all live. First class planned for January 23-25 (Fri-Sun)."
      >
        <Button variant="primary" size="lg" asChild>
          <Link href="/book">
            <Calendar className="h-5 w-5" />
            Book director training
          </Link>
        </Button>
        <Button variant="secondary" size="lg" asChild>
          <Link href="/contact">Talk with us</Link>
        </Button>
      </PageHeader>

      {/* Why choose us */}
      <Card variant="highlight" className="p-6 mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-xl bg-[var(--blue-50)] p-2.5">
            <BookOpen className="h-5 w-5 text-[var(--primary)]" />
          </div>
          <h3>Why choose our director program?</h3>
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

      {/* Course structure */}
      <section className="mb-12">
        <div className="mb-6">
          <Badge variant="default" className="mb-3">Course Structure</Badge>
          <h2 className="mb-2">Focused, live cohort</h2>
          <p className="text-[var(--foreground-muted)] max-w-2xl">
            Leaner than CDA, but still instructor-led. Friday-Sunday cadence to minimize disruption.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 stagger-children">
          {courseModules.map((mod) => (
            <Card key={mod.title} variant="default" className="p-5 flex items-start gap-4 animate-fade-in-up">
              <div className="rounded-xl bg-[var(--blue-50)] p-2.5 shrink-0">
                <mod.icon className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <div>
                <h4 className="mb-1">{mod.title}</h4>
                <p className="text-sm text-[var(--foreground-muted)]">{mod.desc}</p>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-6">
          <Button variant="primary" asChild>
            <Link href="/book">
              Reserve a director seat
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Staff & Make & Take */}
      <section className="mb-12">
        <div className="mb-6">
          <Badge variant="default" className="mb-3">Staff &amp; Make &amp; Take</Badge>
          <h2 className="mb-2">Staff training and Make &amp; Take support</h2>
          <p className="text-[var(--foreground-muted)] max-w-2xl">
            Directors get tools to train teams; optional Make &amp; Take sessions to build materials alongside your staff.
          </p>
        </div>
        <Card variant="default" className="p-6">
          <ul className="space-y-3 mb-6">
            {[
              "Team training guidance to roll out what you learn",
              "Instructor-led Make & Take options to create materials together",
              "Invite your staff; we support org registrations and certificates",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-[var(--foreground-muted)]">
                <CheckCircle2 className="h-4 w-4 text-[var(--teal-500)] mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <Button variant="primary" asChild>
            <Link href="/contact">
              Plan a director + team session
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </Card>
      </section>

      <CTASection
        variant="subtle"
        eyebrow="Next steps"
        title="Lead with confidence"
        description="Book your director training and start building a stronger childcare operation."
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
