import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CTASection } from "@/components/ui/cta-section";
import { HelpCircle, ChevronRight } from "lucide-react";

const faqs = [
  {
    q: "Who are Panhandle Pathways Teacher Training Center LLC?",
    a: "We're local childcare educators in the Florida Panhandle offering instructor-led CDA and director training.",
  },
  {
    q: "Is the training instructor-led or self-paced?",
    a: "Instructor-led only. Even online components are supported by instructors with live touchpoints.",
  },
  {
    q: "When is the next class?",
    a: "We're targeting January 23-25 for the first class. Additional cohorts follow the Friday-Sunday format.",
  },
  {
    q: "Which CDA tracks do you offer?",
    a: "Infant/Toddler, Preschool, and Birth-5 CDA, all instructor-led with portfolio and practicum support.",
  },
  {
    q: "Do you support organizations and teams?",
    a: "Yes. Organizations can register multiple teachers, send invites, and manage certifications in one dashboard.",
  },
  {
    q: "What should I bring?",
    a: "A can-do attitude, readiness to learn, and anything your instructor requests. We'll guide you on materials.",
  },
  {
    q: "Can I get a certificate?",
    a: "Yes. Certificates are added to your account; admins can bulk upload per class date.",
  },
];

export default function FaqPage() {
  return (
    <div className="page-container page-container--narrow">
      <PageHeader
        badge="FAQ"
        title="Common questions"
        description="Instructor-led CDA and director training, local to the Florida Panhandle. Here's what people ask most."
      />

      <Card variant="default" className="divide-y divide-[var(--border)] overflow-hidden mb-16">
        {faqs.map((item) => (
          <div key={item.q} className="p-6">
            <h3 className="text-base mb-2 flex items-start gap-2">
              <HelpCircle className="h-5 w-5 text-[var(--primary)] mt-0.5 shrink-0" />
              {item.q}
            </h3>
            <p className="text-sm text-[var(--foreground-muted)] leading-relaxed ml-7">
              {item.a}
            </p>
          </div>
        ))}
      </Card>

      <CTASection
        variant="subtle"
        eyebrow="Still have questions?"
        title="We're here to help"
        description="Reach out and we'll get back to you with the answers you need."
      >
        <Button variant="primary" size="lg" asChild>
          <Link href="/contact">
            Contact Us
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </CTASection>
    </div>
  );
}
