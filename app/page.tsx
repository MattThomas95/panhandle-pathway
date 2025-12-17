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
    title: "National CDA — Infant/Toddler",
    duration: "Instructor-led (Fri–Sun)",
    format: "Live + supported online",
    next: "First class: Jan 23–25",
    badge: "badge-gold",
    href: "/store",
  },
  {
    title: "National CDA — Preschool",
    duration: "Instructor-led (Fri–Sun)",
    format: "Live + supported online",
    next: "First class: Jan 23–25",
    badge: "badge-gold",
    href: "/store",
  },
  {
    title: "Director Training",
    duration: "Focused live cohort",
    format: "Instructor-led only",
    next: "Next start: Jan 23",
    badge: "badge-blue",
    href: "/store",
  },
];

const featuredPrograms: FeaturedProgram[] = [
  {
    title: "National CDA (Instructor-Led)",
    summary: "Infant/Toddler, Preschool, and Birth–5 CDA tracks guided by real directors. Bring a can-do attitude and we’ll bring the coaching.",
    next: "First class: Jan 23–25",
    highlights: [
      "Live, instructor-led weekends (Fri–Sun)",
      "Practicum guidance and portfolio support",
      "Always instructor-supported (even online)",
    ],
  },
  {
    title: "Director Certification",
    summary: "Local, instructor-led training for owners and directors: operations, compliance, staffing, and growth.",
    next: "Next start: Jan 23",
    highlights: [
      "Lean, focused hours with director coaches",
      "Compliance checklists and staffing playbooks",
      "Designed for Florida Panhandle operators",
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
        <span className="badge badge-blue">Panhandle Pathways Teacher Training Center LLC</span>
        <h1>Instructor-led CDA & director training for local childcare teams</h1>
        <p>
          We’re Florida Panhandle educators helping infant, toddler, and preschool teachers level up. Live, instructor-led weekends only—bring a can-do attitude and get ready to learn.
        </p>
        <div className="hero__cta">
          <Link className="btn-primary" href="/book">
            View classes
          </Link>
          <Link className="btn-gold" href="/book">
            Book a consult
          </Link>
        </div>
        <div className="hero__meta">
          <span className="pill">First class: Jan 23–25</span>
          <span className="pill">Instructor-led only</span>
          <span className="pill">Local & supported</span>
        </div>
      </div>
      <div className="hero__image">
        <div className="hero__image-placeholder">
          <span>Local, instructor-led weekends</span>
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
        <h2>Built for infant, toddler, and preschool teachers</h2>
        <p className="section__lede">Instructor-led, Florida Panhandle-based programs with supported online resources.</p>
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
            <Link className="btn-primary" href="/book">
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
        &quot;The CDA program fit my schedule and the mentors were incredible. I landed a director role two months after finishing.&quot;
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
        <Link className="btn-primary" href="/book">
          Browse programs
        </Link>
      </div>
    </section>
  );
}
