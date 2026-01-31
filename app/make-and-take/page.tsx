import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CTASection } from "@/components/ui/cta-section";
import { Scissors, CheckCircle2, Calendar, ArrowRight, Palette, Package } from "lucide-react";

const included = [
  "Instructor-led build sessions tailored to CDA tracks and directors",
  "Materials lists provided in advance; bring a can-do attitude",
  "Local examples for infant, toddler, and preschool classrooms",
  "Option to bundle with CDA or Director Training for teams",
];

export default function MakeAndTakePage() {
  return (
    <div className="page-container">
      <PageHeader
        badge="Make & Take"
        badgeVariant="gold"
        title="Hands-on Make & Take training"
        description="Instructor-led build sessions to create classroom-ready materials for infant, toddler, and preschool programs."
      >
        <Button variant="primary" size="lg" asChild>
          <Link href="/book">
            <Calendar className="h-5 w-5" />
            Book Make &amp; Take
          </Link>
        </Button>
        <Button variant="secondary" size="lg" asChild>
          <Link href="/contact">Ask a question</Link>
        </Button>
      </PageHeader>

      {/* What's included */}
      <Card variant="highlight" className="p-6 mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-xl bg-[var(--gold-50)] p-2.5">
            <Scissors className="h-5 w-5 text-[var(--gold-600)]" />
          </div>
          <h3>What&apos;s included</h3>
        </div>
        <ul className="space-y-3">
          {included.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-[var(--foreground-muted)]">
              <CheckCircle2 className="h-4 w-4 text-[var(--teal-500)] mt-0.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </Card>

      {/* How it works */}
      <section className="mb-12">
        <div className="mb-6">
          <Badge variant="default" className="mb-3">How it works</Badge>
          <h2 className="mb-2">Build, learn, take home</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-6 stagger-children">
          {[
            { icon: Palette, title: "Build with guidance", desc: "Instructors lead you through each project step-by-step." },
            { icon: Package, title: "Take it home", desc: "Everything you make is yours to use in your classroom." },
            { icon: Scissors, title: "Tailored materials", desc: "Projects matched to your age group and CDA track." },
          ].map((step) => (
            <Card key={step.title} variant="default" className="p-5 text-center animate-fade-in-up">
              <div className="rounded-xl bg-[var(--gold-50)] p-3 w-fit mx-auto mb-3">
                <step.icon className="h-6 w-6 text-[var(--gold-600)]" />
              </div>
              <h4 className="mb-1">{step.title}</h4>
              <p className="text-sm text-[var(--foreground-muted)]">{step.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Schedule */}
      <Card variant="default" className="p-6 mb-12">
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-xl bg-[var(--blue-50)] p-2.5">
            <Calendar className="h-5 w-5 text-[var(--primary)]" />
          </div>
          <h3>Schedule &amp; booking</h3>
        </div>
        <p className="text-sm text-[var(--foreground-muted)] mb-4 leading-relaxed">
          Sessions run alongside CDA/Director cohorts with Friday-Sunday cadence. We support organization registrations with invites and certificates.
        </p>
        <Button variant="primary" asChild>
          <Link href="/book">
            Reserve a session
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </Card>

      <CTASection
        variant="warm"
        eyebrow="Get hands-on"
        title="Build something real for your classroom"
        description="Reserve your Make & Take session and create materials you'll actually use."
      >
        <Button variant="primary" size="lg" asChild>
          <Link href="/book">
            <Calendar className="h-5 w-5" />
            Book Now
          </Link>
        </Button>
      </CTASection>
    </div>
  );
}
