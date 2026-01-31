import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CTASection } from "@/components/ui/cta-section";
import {
  Star,
  MapPin,
  Monitor,
  Users,
  Scissors,
  Calendar,
  ArrowRight,
} from "lucide-react";

const reasons = [
  {
    icon: Star,
    title: "Instructor-led only",
    body: "No self-paced tracks. Live weekends (Fri-Sun) with coaches who guide you through CDA and director programs.",
  },
  {
    icon: MapPin,
    title: "Local Florida Panhandle focus",
    body: "We're local educators with compliance, staffing, and classroom context specific to our region.",
  },
  {
    icon: Monitor,
    title: "Supported online touchpoints",
    body: "Even online components are instructor-supported with check-ins, portfolio reviews, and practicum guidance.",
  },
  {
    icon: Users,
    title: "Org-friendly",
    body: "Invite teams, send signup links, and manage certifications from one place (org dashboard coming).",
  },
  {
    icon: Scissors,
    title: "Hands-on Make & Take",
    body: "Build classroom materials with instructors and take them back to your program.",
  },
];

export default function WhyChooseUsPage() {
  return (
    <div className="page-container">
      <PageHeader
        badge="Why Choose Us"
        title="Panhandle Pathways Teacher Training Center"
        description="Instructor-led CDA and director training for infant, toddler, and preschool teachers — local, supported, and built for teams."
      >
        <Button variant="primary" size="lg" asChild>
          <Link href="/book">
            <Calendar className="h-5 w-5" />
            Book Training
          </Link>
        </Button>
      </PageHeader>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 stagger-children">
        {reasons.map((item) => (
          <Card key={item.title} variant="default" className="p-6 animate-fade-in-up">
            <div className="rounded-xl bg-[var(--blue-50)] p-2.5 w-fit mb-4">
              <item.icon className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <h3 className="mb-2">{item.title}</h3>
            <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">{item.body}</p>
          </Card>
        ))}
      </div>

      <CTASection
        variant="primary"
        eyebrow="Ready to get started?"
        title="Join the next training cohort"
        description="Experience the difference that instructor-led, local training makes."
      >
        <Button variant="gold" size="lg" asChild>
          <Link href="/book">
            Book Training
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CTASection>
    </div>
  );
}
