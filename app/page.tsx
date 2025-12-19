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
    title: "National CDA - Infant/Toddler",
    duration: "Instructor-led (Fri-Sun)",
    format: "Live + supported online",
    next: "First class: Jan 23-25",
    badge: "badge-gold",
    href: "/cda",
  },
  {
    title: "National CDA - Preschool",
    duration: "Instructor-led (Fri-Sun)",
    format: "Live + supported online",
    next: "First class: Jan 23-25",
    badge: "badge-gold",
    href: "/cda",
  },
  {
    title: "Director Training",
    duration: "Focused live cohort",
    format: "Instructor-led only",
    next: "Next start: Jan 23",
    badge: "badge-blue",
    href: "/director-training",
  },
];

const featuredPrograms: FeaturedProgram[] = [
  {
    title: "National CDA (Instructor-led)",
    summary:
      "Infant/Toddler, Preschool, and Birth-5 CDA tracks guided by real directors. Bring a can-do attitude; we'll bring the coaching and accountability.",
    next: "First class: Jan 23-25",
    highlights: [
      "Live, instructor-led weekends (Fri-Sun)",
      "Practicum guidance and portfolio support",
      "Always instructor-supported, never self-paced",
    ],
  },
  {
    title: "Director Certification",
    summary:
      "Local, instructor-led training for owners and directors: operations, compliance, staffing, and growth tailored to Florida Panhandle centers.",
    next: "Next start: Jan 23",
    highlights: [
      "Lean, focused hours with director coaches",
      "Compliance checklists and staffing playbooks",
      "Designed for Florida Panhandle operators",
    ],
  },
];

const stats = [
  { label: "Instructor-led", value: "100%" },
  { label: "First cohort", value: "Jan 23-25" },
  { label: "Region", value: "Florida Panhandle" },
];

export default function Home() {
  return (
    <main className="page">
      <Hero />
      <StatBar />
      <Mission />
      <ProgramHighlights />
      <WhyUs />
      <FeaturedPrograms />
      <CtaBand />
    </main>
  );
}

function Hero() {
  return (
    <header className="hero hero--modern">
      <div className="hero__text">
        <span className="badge badge-blue">Panhandle Pathways Teacher Training Center LLC</span>
        <h1>Childcare training built for infant, toddler, and preschool teams</h1>
        <p>
          Live, instructor-led weekends only - no self-paced. We're Florida Panhandle educators getting teachers and directors ready for the classroom with supported online resources.
        </p>
        <div className="hero__cta">
          <Link className="btn-primary" href="/trainings">
            View trainings
          </Link>
          <Link className="btn-gold" href="/book">
            Book a consult
          </Link>
        </div>
        <div className="hero__meta">
          <span className="pill">First class: Jan 23-25</span>
          <span className="pill">Instructor-led only</span>
          <span className="pill">Local & supported</span>
        </div>
      </div>
      <div className="hero__card">
        <div className="hero__card-header">
          <div>
            <p className="eyebrow eyebrow-light">Live cohorts</p>
            <h3>Instructor-led weekends</h3>
          </div>
          <span className="badge badge-gold">Jan 23-25</span>
        </div>
        <ul className="hero__list">
          <li>Bring a can-do attitude - our instructors bring the structure.</li>
          <li>Friday-Sunday cadence with guided online support between sessions.</li>
          <li>Tracks for Infant/Toddler, Preschool CDA, and Director Training.</li>
          <li>Local team that knows Panhandle classrooms and regulations.</li>
        </ul>
        <div className="hero__card-footer">
          <div>
            <p className="eyebrow eyebrow-light">Next up</p>
            <strong>Reserve your spot for Jan 23-25</strong>
          </div>
          <Link className="btn-primary" href="/book">
            Book training
          </Link>
        </div>
      </div>
    </header>
  );
}

function StatBar() {
  return (
    <section className="stat-bar">
      {stats.map((stat) => (
        <div key={stat.label} className="stat-bar__item">
          <div className="stat-bar__value">{stat.value}</div>
          <div className="stat-bar__label">{stat.label}</div>
        </div>
      ))}
    </section>
  );
}

function Mission() {
  return (
    <section className="section">
      <div className="section__header">
        <p className="eyebrow">Mission</p>
        <h2>Preparing the future of child development professionals</h2>
        <p className="section__lede">
          We are led by veteran early-childhood educators and directors who have built and run programs across the Florida Panhandle. Our mission is to train the next wave of infant, toddler, preschool, and director talent with structured, instructor-led cohorts and real-world coaching.
        </p>
      </div>
    </section>
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
          <article className="card card--program" key={program.title}>
            <div className="card__head">
              <h3>{program.title}</h3>
              {program.badge ? <span className={`badge ${program.badge}`}>Featured</span> : null}
            </div>
            <p className="card__meta">
              {program.duration} - {program.format}
            </p>
            <p className="card__next">{program.next}</p>
            <div className="card__footer">
              <Link className="btn-primary" href={program.href}>
                View details
              </Link>
              <Link className="link" href="/book">
                Book now
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function WhyUs() {
  const reasons = [
    {
      title: "Instructor-led only",
      body: "Live weekends with instructor support between sessions - no self-paced drift.",
    },
    {
      title: "Panhandle-specific",
      body: "Built by local directors who know Florida requirements and childcare realities.",
    },
    {
      title: "Career-focused",
      body: "Portfolio guidance, compliance checklists, and director-readiness coaching.",
    },
  ];

  return (
    <section className="section-band">
      <div className="section__header">
        <p className="eyebrow eyebrow-light">Why us</p>
        <h2>Training that matches the way you work</h2>
        <p className="section__lede">
          Practical, supported learning - bring your energy, we'll bring the structure, instructors, and accountability.
        </p>
      </div>
      <div className="grid-cards">
        {reasons.map((reason) => (
          <article className="card card--frosted" key={reason.title}>
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
        <h2>Training tracks</h2>
      </div>
      <div className="grid-cards grid-cards--wide">
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
              <Link className="link" href={program.title.includes("Director") ? "/director-training" : "/cda"}>
                View program
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CtaBand() {
  return (
    <section className="section-band section-band--cta">
      <div className="cta">
        <div>
          <p className="eyebrow eyebrow-light">Ready for the first cohort?</p>
          <h2>Reserve Jan 23-25 and train with us</h2>
          <p>Instructor-led weekends only. We'll follow up with details and prep lists.</p>
        </div>
        <div className="cta__actions">
          <Link className="btn-gold" href="/book">
            Book a consult
          </Link>
          <Link className="btn-primary" href="/trainings">
            Browse trainings
          </Link>
        </div>
      </div>
    </section>
  );
}
