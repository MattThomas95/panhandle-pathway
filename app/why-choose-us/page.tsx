import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CTASection } from "@/components/ui/cta-section";
import {
  Target,
  Heart,
  Sparkles,
  MapPin,
  Users,
  Calendar,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  BookOpen,
  Scissors,
  Monitor,
} from "lucide-react";

const navHighlights = [
  "About Us",
  "CDA Express Training",
  "In-Person Seminars",
  "Hands-On Sessions",
  "Curriculum",
];

const purposes = [
  {
    label: "Our Purpose",
    title: "PPTTC exists to",
    description: "Empower early childhood educators with relationship-based, instructor-led training that transforms classroom practices and ignites a passion for teaching.",
    color: "blue",
  },
  {
    label: "Our Purpose",
    title: "PPTTC exists to",
    description: "Bridge the gap between training requirements and real-world classroom success through hands-on, engaging experiences that stick.",
    color: "teal",
  },
  {
    label: "Our Mission",
    title: "PPTTC exists to",
    description: "Build a community of confident, well-prepared educators who create nurturing environments where every child can thrive and develop a lifelong love of learning.",
    color: "gold",
  },
];

const supportFeatures = [
  "Individualized Participant Outcome Plans",
  "Express CDA Training Tracks via Fri-Sun Sessions",
  "Online Training Components Instructor Supported",
  "Weekly Check-ins, Portfolio Reviews, and Practicum Guidance",
  "Individualized Coaching and Group Learning",
];

const educationalExperiences = [
  "In-person and Instructor Led Trainings",
  "Individualized Participant Outcome Plans",
  "Express CDA Training Tracks via Week-end Sessions",
  "Online Training Components Instructor Supported",
  "Weekly Check-ins, Portfolio Reviews, and Practicum Guidance",
  "Individualized Coaching and Group Learning",
  "Organizational Dashboard to access learning links and manage certifications",
  "Create Take-Home Teaching Tools and Resources",
];

export default function WhyChooseUsPage() {
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

      {/* Navigation Highlights */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {navHighlights.map((item, i) => (
          <span key={item} className="flex items-center text-sm font-bold text-[var(--foreground)]">
            {item}
            {i < navHighlights.length - 1 && (
              <span className="mx-2 text-[var(--gold-500)]">**</span>
            )}
          </span>
        ))}
      </div>

      {/* Hero Section */}
      <section className="text-center mb-12">
        <Badge variant="blue" className="mb-4">Why Choose Us</Badge>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-6">
          Panhandle Pathways Teacher Training Center
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
        <Card variant="highlight" className="p-8">
          <p className="text-lg text-[var(--foreground)] leading-relaxed">
            <span className="font-bold">Panhandle Pathways Teacher Training Center LLC</span> has been created{" "}
            <span className="text-[var(--primary)] font-bold">FOR</span> early childhood teachers{" "}
            <span className="text-[var(--primary)] font-bold">BY</span> early childhood teachers.
          </p>
          <p className="text-[var(--foreground-muted)] leading-relaxed mt-4">
            Knowing the complexity of caring for and teaching young children, PPTTC emphasizes training
            that exceeds requirements, while meeting the diverse needs of the early childhood educator.
          </p>
        </Card>
      </section>

      {/* Purpose & Mission Cards */}
      <section className="mb-12">
        <div className="grid md:grid-cols-3 gap-6">
          {purposes.map((purpose, i) => (
            <Card
              key={i}
              variant="default"
              className={`p-6 border-2 ${
                purpose.color === "blue"
                  ? "border-[var(--blue-300)] bg-gradient-to-br from-[var(--blue-50)] to-white"
                  : purpose.color === "teal"
                  ? "border-[var(--teal-300)] bg-gradient-to-br from-[var(--teal-50)] to-white"
                  : "border-[var(--gold-300)] bg-gradient-to-br from-[var(--gold-50)] to-white"
              }`}
            >
              <Badge
                variant={purpose.color === "gold" ? "gold" : purpose.color === "teal" ? "default" : "blue"}
                className="mb-3"
              >
                {purpose.label}
              </Badge>
              <h3 className="text-lg font-bold mb-3 text-[var(--foreground)]">{purpose.title}</h3>
              <p className="text-sm text-[var(--foreground-muted)] leading-relaxed italic">
                {purpose.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Why Choose Us - Two Column */}
      <section className="mb-12">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Local Focus */}
          <Card className="p-6 border-2 border-[var(--teal-400)] rounded-3xl bg-gradient-to-br from-[var(--teal-50)] to-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full bg-[var(--teal-100)] p-2.5">
                <MapPin className="h-5 w-5 text-[var(--teal-600)]" />
              </div>
              <h3 className="text-xl font-bold text-[var(--teal-700)]">WHY CHOOSE US?</h3>
            </div>
            <h4 className="font-bold italic text-[var(--foreground)] mb-3">Local Florida Panhandle Focus</h4>
            <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">
              We are local early childhood educators understanding compliance, staffing issues,
              classroom context, and everyday requirements specific to our region.
            </p>
          </Card>

          {/* We Support Each Participant */}
          <Card className="p-6 border-2 border-[var(--purple-400)] rounded-3xl bg-gradient-to-br from-purple-50 to-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full bg-purple-100 p-2.5">
                <Heart className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-purple-700">WHY CHOOSE US?</h3>
            </div>
            <h4 className="font-bold italic text-[var(--foreground)] mb-3">We Support Each Participant By:</h4>
            <ul className="space-y-2">
              {supportFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-[var(--foreground-muted)]">
                  <span className="text-purple-500 font-bold">*</span>
                  {feature}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      {/* Educational Experiences - Full Width */}
      <section className="mb-12">
        <Card className="p-8 border-2 border-[var(--error)] bg-gradient-to-br from-red-50 to-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-full bg-red-100 p-2.5">
              <Sparkles className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-red-600">WHY CHOOSE US?</h3>
          </div>
          <h4 className="font-bold italic text-[var(--foreground)] text-lg mb-4">
            Our Educational Experiences Include More
          </h4>
          <div className="grid md:grid-cols-2 gap-3">
            {educationalExperiences.map((experience) => (
              <div key={experience} className="flex items-start gap-2 text-[var(--foreground-muted)]">
                <span className="text-red-500 font-bold">*</span>
                {experience}
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Quick Links */}
      <section className="mb-12">
        <div className="text-center mb-8">
          <Badge variant="gold" className="mb-3">Explore Our Programs</Badge>
          <h2>Find the Right Training for You</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="default" className="p-5 text-center hover:shadow-lg transition-shadow">
            <div className="rounded-xl bg-[var(--gold-100)] p-3 w-fit mx-auto mb-3">
              <GraduationCap className="h-6 w-6 text-[var(--gold-500)]" />
            </div>
            <h4 className="text-sm font-bold mb-2">CDA Training</h4>
            <Button variant="primary" size="sm" asChild className="w-full">
              <Link href="/cda">Learn More</Link>
            </Button>
          </Card>
          <Card variant="default" className="p-5 text-center hover:shadow-lg transition-shadow">
            <div className="rounded-xl bg-[var(--blue-50)] p-3 w-fit mx-auto mb-3">
              <BookOpen className="h-6 w-6 text-[var(--primary)]" />
            </div>
            <h4 className="text-sm font-bold mb-2">All Trainings</h4>
            <Button variant="primary" size="sm" asChild className="w-full">
              <Link href="/trainings">Explore</Link>
            </Button>
          </Card>
          <Card variant="default" className="p-5 text-center hover:shadow-lg transition-shadow">
            <div className="rounded-xl bg-[var(--teal-50)] p-3 w-fit mx-auto mb-3">
              <Scissors className="h-6 w-6 text-[var(--teal-500)]" />
            </div>
            <h4 className="text-sm font-bold mb-2">Make & Take</h4>
            <Button variant="primary" size="sm" asChild className="w-full">
              <Link href="/make-and-take">View</Link>
            </Button>
          </Card>
          <Card variant="default" className="p-5 text-center hover:shadow-lg transition-shadow">
            <div className="rounded-xl bg-purple-100 p-3 w-fit mx-auto mb-3">
              <Monitor className="h-6 w-6 text-purple-500" />
            </div>
            <h4 className="text-sm font-bold mb-2">Book Training</h4>
            <Button variant="primary" size="sm" asChild className="w-full">
              <Link href="/book">Book Now</Link>
            </Button>
          </Card>
        </div>
      </section>

      <CTASection
        variant="primary"
        eyebrow="Ready to get started?"
        title="Join the next training cohort"
        description="Experience the difference that instructor-led, local training makes. Created FOR teachers BY teachers."
      >
        <Button variant="gold" size="lg" asChild>
          <Link href="/book">
            Book Training
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button variant="secondary" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20" asChild>
          <Link href="/contact">Contact Us</Link>
        </Button>
      </CTASection>
    </div>
  );
}
