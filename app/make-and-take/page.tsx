import Link from "next/link";

export default function MakeAndTakePage() {
  return (
    <main className="page">
      <header className="section__header" style={{ marginBottom: 24 }}>
        <p className="eyebrow">Make &amp; Take</p>
        <h1>Hands-on Make &amp; Take training</h1>
        <p className="section__lede">
          Instructor-led build sessions to create classroom-ready materials for infant, toddler, and preschool programs.
        </p>
        <div className="hero__cta" style={{ marginTop: 12 }}>
          <Link className="btn-primary" href="/book">
            Book Make &amp; Take
          </Link>
          <Link className="btn-ghost" href="/contact">
            Ask a question
          </Link>
        </div>
      </header>

      <section className="card card--bordered" style={{ padding: 24, marginBottom: 20 }}>
        <h3>What’s included</h3>
        <ul className="feature-list" style={{ marginTop: 10 }}>
          <li>Instructor-led build sessions tailored to CDA tracks and directors</li>
          <li>Materials lists provided in advance; bring a can-do attitude</li>
          <li>Local examples for infant, toddler, and preschool classrooms</li>
          <li>Option to bundle with CDA or Director Training for teams</li>
        </ul>
      </section>

      <section className="card card--bordered" style={{ padding: 24 }}>
        <h3>Schedule &amp; booking</h3>
        <p className="section__lede">
          Sessions run alongside CDA/Director cohorts with Friday–Sunday cadence. We support organization registrations
          with invites and certificates.
        </p>
        <div className="hero__cta" style={{ marginTop: 12 }}>
          <Link className="btn-primary" href="/book">
            Reserve a Make &amp; Take session
          </Link>
        </div>
      </section>
    </main>
  );
}
