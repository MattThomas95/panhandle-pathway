import Link from "next/link";

const tracks = [
  {
    name: "Infant/Toddler CDA",
    seats: "10 slots",
    price: "$450 (standalone $500)",
    notes: "Instructor-led weekends (Fri–Sun)",
  },
  {
    name: "Preschool CDA",
    seats: "10 slots",
    price: "$450",
    notes: "Instructor-led weekends (Fri–Sun)",
  },
  {
    name: "Birth–5 CDA",
    seats: "5 slots",
    price: "$500",
    notes: "Instructor-led weekends (Fri–Sun)",
  },
];

export default function CdaPage() {
  return (
    <main className="page">
      <header className="section__header" style={{ marginBottom: 24 }}>
        <p className="eyebrow">CDA Training</p>
        <h1>National CDA — Instructor-led only</h1>
        <p className="section__lede">
          Infant/Toddler, Preschool, and Birth–5 CDA tracks led by instructors. First class is planned for January 23–25
          with Friday–Sunday sessions.
        </p>
        <div className="hero__cta" style={{ marginTop: 12 }}>
          <Link className="btn-primary" href="/book">
            Book training
          </Link>
          <Link className="btn-ghost" href="/contact">
            Ask a question
          </Link>
        </div>
      </header>

      <section className="card" style={{ padding: 24, marginBottom: 28 }}>
        <h3>Why choose us?</h3>
        <ul className="feature-list" style={{ marginTop: 10 }}>
          <li>Instructor-led only — no self-paced tracks</li>
          <li>Local Florida Panhandle educators with live support</li>
          <li>Portfolio and practicum guidance; supported even online</li>
          <li>Weekend cadence (Fri–Sun) to fit working teachers</li>
          <li>Bring a can-do attitude; we bring the coaching and checklists</li>
        </ul>
      </section>

      <section className="section">
        <div className="section__header">
          <p className="eyebrow">Tracks</p>
          <h2>Choose your CDA track</h2>
          <p className="section__lede">Instructor-led weekends, capped seats, and focused outcomes.</p>
        </div>
        <div className="grid-cards">
          {tracks.map((track) => (
            <article className="card card--bordered" key={track.name}>
              <h3>{track.name}</h3>
              <p className="section__lede">{track.notes}</p>
              <div className="pill" style={{ marginTop: 8 }}>
                {track.seats}
              </div>
              <div style={{ marginTop: 8, fontWeight: 700 }}>{track.price}</div>
              <div style={{ marginTop: 12 }}>
                <Link className="btn-primary" href="/book">
                  Reserve a slot
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section__header">
          <p className="eyebrow">Staff Training</p>
          <h2>Supported learning for infant, toddler, and preschool educators</h2>
          <p className="section__lede">
            Live, instructor-led sessions plus supported online touchpoints. We focus on practice, compliance, and real
            classroom readiness.
          </p>
        </div>
        <div className="card card--bordered" style={{ padding: 24 }}>
          <ul className="feature-list">
            <li>Weekly instructor check-ins with actionable feedback</li>
            <li>Portfolio checkpoints and practicum guidance</li>
            <li>Compliance-ready documentation and local context</li>
            <li>“Can do” expectations: show up prepared to learn and practice</li>
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="section__header">
          <p className="eyebrow">Make &amp; Take</p>
          <h2>Hands-on Make &amp; Take training</h2>
          <p className="section__lede">
            Practical, classroom-ready materials you can build and take with you—guided by instructors.
          </p>
        </div>
        <div className="card card--bordered" style={{ padding: 24 }}>
          <ul className="feature-list">
            <li>Instructor-led build sessions tailored to your CDA track</li>
            <li>Materials lists provided in advance</li>
            <li>Local examples for infant, toddler, and preschool classrooms</li>
          </ul>
          <div className="hero__cta" style={{ marginTop: 14 }}>
            <Link className="btn-primary" href="/book">
              Book Make &amp; Take
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
