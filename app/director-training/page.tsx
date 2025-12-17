import Link from "next/link";

export default function DirectorTrainingPage() {
  return (
    <main className="page">
      <header className="section__header" style={{ marginBottom: 24 }}>
        <p className="eyebrow">Director Training</p>
        <h1>Instructor-led director training for childcare leaders</h1>
        <p className="section__lede">
          Local, instructor-led sessions focused on operations, compliance, staffing, and growth. Fewer hours than CDA,
          but all live. First class planned for January 23–25 (Fri–Sun).
        </p>
        <div className="hero__cta" style={{ marginTop: 12 }}>
          <Link className="btn-primary" href="/book">
            Book director training
          </Link>
          <Link className="btn-ghost" href="/contact">
            Talk with us
          </Link>
        </div>
      </header>

      <section className="card" style={{ padding: 24, marginBottom: 28 }}>
        <h3>Why choose us?</h3>
        <ul className="feature-list" style={{ marginTop: 10 }}>
          <li>Instructor-led only — focused hours for owners and directors</li>
          <li>Local Florida Panhandle context, compliance, and staffing guidance</li>
          <li>Playbooks for enrollment, staffing, and day-to-day operations</li>
          <li>Designed to pair with CDA pathways when needed</li>
        </ul>
      </section>

      <section className="section">
        <div className="section__header">
          <p className="eyebrow">Course structure</p>
          <h2>Focused, live cohort</h2>
          <p className="section__lede">
            Leaner than CDA, but still instructor-led. Friday–Sunday cadence to minimize disruption.
          </p>
        </div>
        <div className="card card--bordered" style={{ padding: 24 }}>
          <ul className="feature-list">
            <li>Operations &amp; compliance: checklists and templates</li>
            <li>Staffing &amp; culture: hiring, onboarding, retention</li>
            <li>Growth: enrollment, parent communication, budgeting basics</li>
            <li>“Can do” expectation: come prepared to learn and act</li>
          </ul>
          <div className="hero__cta" style={{ marginTop: 14 }}>
            <Link className="btn-primary" href="/book">
              Reserve a director seat
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section__header">
          <p className="eyebrow">Staff &amp; Make &amp; Take</p>
          <h2>Staff training and Make &amp; Take support</h2>
          <p className="section__lede">
            Directors get tools to train teams; optional Make &amp; Take sessions to build materials alongside your staff.
          </p>
        </div>
        <div className="card card--bordered" style={{ padding: 24 }}>
          <ul className="feature-list">
            <li>Team training guidance to roll out what you learn</li>
            <li>Instructor-led Make &amp; Take options to create materials together</li>
            <li>Invite your staff; we support org registrations and certificates</li>
          </ul>
          <div className="hero__cta" style={{ marginTop: 14 }}>
            <Link className="btn-primary" href="/contact">
              Plan a director + team session
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
