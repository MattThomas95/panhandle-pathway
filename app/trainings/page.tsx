import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { CTASection } from "@/components/ui/cta-section";
import {
  GraduationCap,
  BookOpen,
  Scissors,
  ArrowRight,
  Calendar,
  CheckCircle2,
} from "lucide-react";

const trainings = [
  {
    icon: GraduationCap,
    title: "National CDA",
    badge: "CDA",
    badgeVariant: "gold" as const,
    desc: "Infant/Toddler, Preschool, Birth-5 tracks. Instructor-led weekends.",
    features: [
      "3 specialized tracks",
      "Practicum & portfolio guidance",
      "Live weekend sessions (Fri-Sun)",
    ],
    href: "/cda",
  },
  {
    icon: BookOpen,
    title: "Director Training",
    badge: "Director",
    badgeVariant: "blue" as const,
    desc: "Focused live cohort for directors and owners.",
    features: [
      "Operations & compliance training",
      "Staffing & growth playbooks",
      "Lean, focused hours",
    ],
    href: "/director-training",
  },
  {
    icon: Scissors,
    title: "Make & Take",
    badge: "Hands-on",
    badgeVariant: "default" as const,
    desc: "Hands-on build sessions with instructors; materials you can take to your classroom.",
    features: [
      "Build real classroom materials",
      "Instructor-guided projects",
      "Bundleable with CDA/Director",
    ],
    href: "/make-and-take",
  },
];

export default function TrainingsPage() {
  return (
    <div className="page-container">
      <PageHeader
        badge="Training Programs"
        title="Instructor-led programs"
        description="CDA tracks, Director Training, and Make & Take — all instructor-led. First class planned for January 23-25."
      >
        <Button variant="primary" size="lg" asChild>
          <Link href="/book">
            <Calendar className="h-5 w-5" />
            Book Training
          </Link>
        </Button>
      </PageHeader>

      <div className="grid md:grid-cols-3 gap-6 mb-16 stagger-children">
        {trainings.map((item) => (
          <Card key={item.title} variant="default" className="flex flex-col animate-fade-in-up">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="rounded-xl bg-[var(--blue-50)] p-2.5">
                  <item.icon className="h-5 w-5 text-[var(--primary)]" />
                </div>
                <Badge variant={item.badgeVariant}>{item.badge}</Badge>
              </div>
              <CardTitle className="mt-3">{item.title}</CardTitle>
              <CardDescription>{item.desc}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-2.5">
                {item.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[var(--foreground-muted)]">
                    <CheckCircle2 className="h-4 w-4 text-[var(--teal-500)] mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="primary" size="sm" className="w-full" asChild>
                <Link href={item.href}>
                  View {item.badge}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <CTASection
        variant="subtle"
        eyebrow="Not sure which program?"
        title="We'll help you find the right fit"
        description="Contact us and we'll walk you through the best option for your goals and schedule."
      >
        <Button variant="primary" size="lg" asChild>
          <Link href="/contact">Get in touch</Link>
        </Button>
      </CTASection>
    </div>
  );
}
