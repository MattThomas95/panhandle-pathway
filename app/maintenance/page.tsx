import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Mail, HelpCircle, Clock } from "lucide-react";

export const metadata = {
  title: "Under Development | Panhandle Pathways Teacher Training Center LLC",
};

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center">
        <div className="rounded-2xl bg-gradient-to-br from-[var(--blue-50)] to-[var(--teal-50)] p-5 w-fit mx-auto mb-6">
          <Clock className="h-10 w-10 text-[var(--primary)]" />
        </div>

        <Badge variant="warning" className="mb-4">Under Development</Badge>
        <h1 className="mb-4">We&apos;re getting the classroom ready</h1>
        <p className="text-[var(--foreground-muted)] text-lg leading-relaxed mb-8 max-w-md mx-auto">
          The site is temporarily locked while we finish the instructor-led CDA and director training
          experience. First class is planned for January 23-25.
        </p>

        <div className="flex justify-center gap-3 flex-wrap mb-10">
          <Button variant="primary" size="lg" asChild>
            <Link href="mailto:info@panhandlepathways.com">
              <Mail className="h-5 w-5" />
              Email us
            </Link>
          </Button>
          <Button variant="secondary" size="lg" asChild>
            <Link href="/faq">
              <HelpCircle className="h-5 w-5" />
              View FAQ
            </Link>
          </Button>
        </div>

        <Card variant="default" className="p-6 text-left">
          <h3 className="text-base mb-4">What to expect</h3>
          <ul className="space-y-3">
            {[
              "Instructor-led courses for infant, toddler, and preschool certificates",
              "Local to the Florida Panhandle",
              "Organization support with invites and certificates coming soon",
            ].map((item) => (
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
