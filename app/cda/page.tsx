import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { CTASection } from "@/components/ui/cta-section";
import {
  GraduationCap,
  CheckCircle2,
  Users,
  Calendar,
  ArrowRight,
  Sparkles,
  Award,
  Heart,
} from "lucide-react";

const tracks = [
  {
    name: "Infant/Toddler CDA",
    seats: "10 slots",
    price: "$450",
    priceNote: "standalone $500",
    notes: "For educators working with children 0-36 months",
    icon: "👶",
  },
  {
    name: "Preschool CDA",
    seats: "10 slots",
    price: "$450",
    notes: "For educators working with children 3-5 years",
    icon: "🎨",
  },
  {
    name: "Birth-5 CDA",
    seats: "5 slots",
    price: "$500",
    notes: "Comprehensive track covering all age groups",
    icon: "🌟",
  },
];

const whyChooseFeatures = [
  "Local Florida Panhandle Academy",
  "Certified In-field Educators",
  "Specialized In-Person Training",
  "Outcome-based Feedback and Support",
  "Portfolio Development and Practicum Guidance",
  "Weekend Courses (Fri through Sun) to Support Working Participants",
];

const trackFeatures = [
  "Instructor-Led weekend classes with capped seats for individualized attention",
  "Live training sessions enhanced by supportive online touchpoints between weekends",
  "Real-world focus on classroom practice, state compliance, and job readiness",
  "Weekly one-on-one instructor check-ins with actionable, personalized feedback",
  "Comprehensive portfolio development with classroom observation guidance",
  "Compliance-ready documentation tailored to Florida Panhandle requirements",
];

export default function CdaPage() {
  return (
    <div className="page-container">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/panhandle-logo-enhanced-final.png"
          alt="Panhandle Pathways"
          className="h-24 w-auto object-contain"
        />
      </div>

      {/* Header Section */}
      <section className="text-center mb-12 p-8 md:p-10 rounded-2xl bg-gradient-to-br from-[var(--blue-50)] via-[var(--teal-50)] to-[var(--blue-50)] border border-[var(--blue-200)]">
        <Badge variant="blue" className="mb-4">CDA TRAINING</Badge>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[var(--blue-900)] mb-3">
          National Child Development Associate (CDA)
        </h1>
        <h2 className="text-xl md:text-2xl font-bold text-[var(--primary)] mb-4">
          Instructor Led - Teacher Centered
        </h2>
        <p className="text-[var(--foreground-muted)] mb-2 text-lg">
          Available CDA Tracks: <span className="font-bold text-[var(--foreground)]">Infant/Toddler, Preschool, and Birth through 5 Years</span>
        </p>
        <p className="text-[var(--foreground)] font-bold mb-8 text-lg">
          <span className="text-[var(--error)]">Enroll NOW!</span> First class:{" "}
          <span className="text-[var(--primary)]">January 23-25, 2026</span> (Friday through Sunday)
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button variant="primary" size="lg" asChild>
            <Link href="/book">
              <Calendar className="h-5 w-5" />
              Reserve Your Seat
            </Link>
          </Button>
          <Button variant="secondary" size="lg" asChild>
            <Link href="/contact">Have Questions? Let&apos;s Talk</Link>
          </Button>
        </div>
      </section>

      {/* Why Choose Us Section - Enhanced Card */}
      <section className="mb-12">
        <div className="relative overflow-hidden rounded-3xl">
          {/* Gradient background matching the image */}
          <div className="absolute inset-0 bg-gradient-to-b from-amber-50 via-yellow-50/80 to-orange-50/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-100/30 via-transparent to-yellow-100/30" />

          {/* Card content */}
          <div className="relative p-8 md:p-12 border-2 border-[var(--gold-300)] rounded-3xl">
            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold italic text-[var(--primary)] mb-3">
                Why Choose Us?
              </h2>
              <p className="text-xl md:text-2xl font-bold text-[var(--blue-900)]">
                Because <span className="text-[var(--teal-500)]">WE</span> are Committed to{" "}
                <span className="text-[var(--gold-500)]">YOUR</span> Success
              </p>
            </div>

            {/* Training Sessions Include */}
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-6 text-center">
              Training Sessions Include:
            </h3>

            <ul className="space-y-4 max-w-2xl mx-auto mb-8">
              {whyChooseFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--teal-100)] flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-[var(--teal-500)]" />
                  </div>
                  <span className="text-[var(--foreground-muted)] text-lg">{feature}</span>
                </li>
              ))}
            </ul>

            {/* Red tagline */}
            <p className="text-center text-lg md:text-xl font-bold text-[var(--error)]">
              Bring a can-do attitude. We bring the coaching and checklists
            </p>
          </div>
        </div>
      </section>

      {/* Tracks Section */}
      <section className="mb-12">
        <Card className="p-8 md:p-10 border-2 border-[var(--primary)] bg-gradient-to-br from-[var(--blue-50)] to-white rounded-3xl">
          <div className="mb-8">
            <Badge variant="blue" className="mb-3">TRACKS</Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] mb-3">
              Choose Your CDA Track — Infant, Toddler, or Preschool
            </h2>
            <p className="text-[var(--foreground-muted)] text-lg">
              Supportive, structured learning designed for working early childhood educators
            </p>
          </div>

          <ul className="space-y-4">
            {trackFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--blue-100)] flex items-center justify-center mt-0.5">
                  <CheckCircle2 className="h-4 w-4 text-[var(--primary)]" />
                </div>
                <span className="text-[var(--foreground-muted)]">{feature}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* Track Cards */}
      <section className="mb-12">
        <div className="text-center mb-8">
          <Badge variant="gold" className="mb-3">
            <Sparkles className="h-3 w-3 mr-1" />
            Available Tracks
          </Badge>
          <h2 className="mb-2">Select Your CDA Track</h2>
          <p className="text-[var(--foreground-muted)]">
            Small class sizes, weekend schedules, and personalized outcomes
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 stagger-children">
          {tracks.map((track) => (
            <Card key={track.name} variant="bordered" className="flex flex-col animate-fade-in-up hover:shadow-xl transition-all hover:-translate-y-1">
              <CardHeader className="text-center pb-2">
                <p className="text-5xl mb-3">{track.icon}</p>
                <CardTitle className="text-xl">{track.name}</CardTitle>
                <p className="text-sm text-[var(--foreground-muted)] mt-2">{track.notes}</p>
              </CardHeader>
              <CardContent className="flex-1 text-center pt-4">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Badge variant="outline">
                    <Users className="h-3 w-3 mr-1" />
                    {track.seats}
                  </Badge>
                </div>
                <p className="text-4xl font-extrabold text-[var(--blue-900)]">
                  {track.price}
                </p>
                {track.priceNote && (
                  <p className="text-sm text-[var(--foreground-muted)] mt-2">
                    ({track.priceNote})
                  </p>
                )}
              </CardContent>
              <CardFooter className="pt-4">
                <Button variant="primary" className="w-full" asChild>
                  <Link href="/book">
                    Reserve Your Spot
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="mb-12">
        <div className="text-center mb-8">
          <Badge variant="default" className="mb-3">
            <Heart className="h-3 w-3 mr-1" />
            Why It Matters
          </Badge>
          <h2 className="mb-2">Invest in Your Future</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Card variant="default" className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-[var(--gold-100)] p-3 shrink-0">
                <Award className="h-6 w-6 text-[var(--gold-500)]" />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2">Nationally Recognized Credential</h4>
                <p className="text-[var(--foreground-muted)]">
                  The CDA is the most widely recognized credential in early childhood education.
                  Employers across the country value CDA-certified educators for their proven
                  competency and dedication to quality care.
                </p>
              </div>
            </div>
          </Card>
          <Card variant="default" className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-[var(--blue-50)] p-3 shrink-0">
                <GraduationCap className="h-6 w-6 text-[var(--primary)]" />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2">Advance Your Career</h4>
                <p className="text-[var(--foreground-muted)]">
                  Earning your CDA demonstrates your commitment to professional growth.
                  Open doors to leadership roles, higher pay, and new opportunities
                  in childcare centers, Head Start programs, and schools.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection
        variant="primary"
        eyebrow="Ready to take the next step?"
        title="Begin Your CDA Journey Today"
        description="Join our January cohort and earn your National CDA credential with the support of local, experienced educators who are committed to YOUR success."
      >
        <Button variant="gold" size="lg" asChild>
          <Link href="/book">
            <Calendar className="h-5 w-5" />
            Reserve Your Seat
          </Link>
        </Button>
        <Button variant="secondary" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20" asChild>
          <Link href="/contact">Contact Us</Link>
        </Button>
      </CTASection>
    </div>
  );
}
