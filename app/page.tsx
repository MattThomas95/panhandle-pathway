import Link from "next/link";

type ProgramHighlight = {
  title: string;
  duration: string;
  format: string;
  next: string;
  badge?: "badge-blue" | "badge-gold";
  href: string;
};

type FeaturedProgram = {
  title: string;
  summary: string;
  next: string;
  highlights: string[];
};

const highlights: ProgramHighlight[] = [
  {
    title: "Child Development Associate (CDA)",
    duration: "8-12 weeks",
    format: "Online / Hybrid",
    next: "Next cohort: April 15",
    badge: "badge-gold",
    href: "/store",
  },
  {
    title: "Director Certification",
    duration: "6-10 weeks",
    format: "Online / Hybrid",
    next: "Next cohort: May 6",
    badge: "badge-blue",
    href: "/store",
  },
  {
    title: "Leadership Workshops",
    duration: "1-2 days",
    format: "Live virtual",
    next: "Monthly sessions",
    href: "/store",
  },
];

const featuredPrograms: FeaturedProgram[] = [
  {
    title: "CDA Program",
    summary: "Build a career-ready portfolio with instructor-led support and flexible pacing for working educators.",
    next: "Starts April 15",
    highlights: [
      "Weekly live coaching and feedback",
      "Self-paced modules plus practicum guidance",
      "Job placement support after completion",
    ],
  },
  {
    title: "Director Certification",
    summary: "Prepare for leadership with operations, compliance, and team management training tailored to childcare directors.",
    next: "Starts May 6",
    highlights: [
      "Handbook templates and compliance checklists",
      "Financial stewardship and enrollment growth",
      "Capstone project reviewed by directors",
    ],
  },
];

export default function Home() {
  return (
    <main className="page">
      <Hero />
      <ProgramHighlights />
      <WhyUs />
      <FeaturedPrograms />
      <Testimonials />
      <CtaBand />
    </main>
  );
}

function Hero() {
  return (
    <header className="hero">
      <div className="hero__text">
        <span className="badge badge-blue">CDA & Director Programs</span>
        <h1>Accelerate your childcare career with Panhandle Pathways</h1>
        <p>
          Online and hybrid training, expert instructors, and flexible pacing built for working educators.
        </p>
        <div className="hero__cta">
          <Link className="btn-primary" href="/store">
            Browse programs
          </Link>
          <Link className="btn-gold" href="/book">
            Book a consult
          </Link>
        </div>
        <div className="hero__meta">
          <span className="pill">Flexible pacing</span>
          <span className="pill">Instructor-led</span>
          <span className="pill">Job-ready portfolio</span>
        </div>
      </div>
      <div className="hero__image">
        <div className="hero__image-placeholder">
          <span>Drop your training photo here</span>
        </div>
      </div>
    </header>
  );
}

function ProgramHighlights() {
  return (
    <section className="section">
      <div className="section__header">
        <p className="eyebrow">Programs</p>
        <h2>Built for working educators</h2>
        <p className="section__lede">Choose the path that fits your schedule and career goals.</p>
      </div>
      <div className="grid-cards">
        {highlights.map((program) => (
          <article className="card" key={program.title}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3>{program.title}</h3>
              {program.badge ? <span className={`badge ${program.badge}`}>Featured</span> : null}
            </div>
            <p>
              {program.duration} | {program.format}
            </p>
            <p style={{ color: "var(--blue-primary)", fontWeight: 600 }}>{program.next}</p>
            <Link className="btn-primary" href={program.href}>
              View details
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

function WhyUs() {
  const reasons = [
    {
      title: "Flexible pacing",
      body: "Self-paced modules with weekly live check-ins so you never lose momentum.",
    },
    {
      title: "Expert instructors",
      body: "Certified childcare directors and CDA specialists guide every cohort.",
    },
    {
      title: "Career outcomes",
      body: "Job placement support, interview prep, and director-readiness portfolio reviews.",
    },
  ];

  return (
    <section className="section-band">
      <div className="section__header">
        <p className="eyebrow eyebrow-light">Why us</p>
        <h2>Training with outcomes</h2>
        <p className="section__lede">
          Practical, supported learning so you can advance without pausing your career.
        </p>
      </div>
      <div className="grid-cards">
        {reasons.map((reason) => (
          <article className="card" key={reason.title}>
            <h3>{reason.title}</h3>
            <p>{reason.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function FeaturedPrograms() {
  return (
    <section className="section">
      <div className="section__header">
        <p className="eyebrow">In depth</p>
        <h2>Featured programs</h2>
      </div>
      <div className="grid-cards">
        {featuredPrograms.map((program) => (
          <article className="card card--bordered" key={program.title}>
            <h3>{program.title}</h3>
            <p className="section__lede">{program.summary}</p>
            <ul className="feature-list">
              {program.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="card__footer">
              <span className="badge badge-gold">{program.next}</span>
              <Link className="link" href="/store">
                View program
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="card" style={{ margin: "48px 0" }}>
      <p className="eyebrow">Testimonials</p>
      <p className="quote">
        "The CDA program fit my schedule and the mentors were incredible. I landed a director role two months after finishing."
      </p>
      <div className="quote__meta">Ashley R., Program Graduate</div>
    </section>
  );
}

function CtaBand() {
  return (
    <section className="section-band" style={{ textAlign: "center" }}>
      <h2>Ready to start?</h2>
      <p style={{ marginBottom: 18 }}>Book a consult or enroll in the next cohort.</p>
      <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
        <Link className="btn-gold" href="/book">
          Book a consult
        </Link>
        <Link className="btn-primary" href="/store">
          Browse programs
        </Link>
      </div>
    </section>
  );
}
