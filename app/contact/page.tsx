import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle2, ArrowRight } from "lucide-react";

const whatToInclude = [
  "Your name and role (teacher, director, org admin)",
  "Which track: Infant/Toddler, Preschool, Birth-5 CDA, or Director Training",
  "Any dates you're targeting (first class: Jan 23-25)",
  "Organization size if registering a team",
];

export default function ContactPage() {
  return (
    <div className="page-container page-container--narrow">
      <div className="flex justify-center mb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/panhandle-logo-enhanced-final.png"
          alt="Panhandle Pathways"
          className="h-20 w-auto object-contain"
        />
      </div>
      <PageHeader
        badge="Contact"
        title="Get in touch"
        description="We're local to the Florida Panhandle and happy to help with CDA and director training questions."
      />

      <div className="space-y-6">
        {/* Email card */}
        <Card variant="highlight" className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-xl bg-[var(--blue-50)] p-2.5">
              <Mail className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <div>
              <h3 className="text-base">Email us</h3>
              <p className="text-sm text-[var(--foreground-muted)]">
                We typically respond within 24 hours
              </p>
            </div>
          </div>
          <Button variant="primary" asChild>
            <Link href="mailto:info@panhandlepathways.com">
              info@panhandlepathways.com
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </Card>

        {/* What to include */}
        <Card variant="default" className="p-6">
          <h3 className="text-base mb-4">What to include in your message</h3>
          <ul className="space-y-3">
            {whatToInclude.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-[var(--foreground-muted)]">
                <CheckCircle2 className="h-4 w-4 text-[var(--teal-500)] mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
