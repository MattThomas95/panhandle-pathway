import Link from "next/link";

const trainingLinks = [
  {
    title: "National CDA",
    desc: "Infant/Toddler, Preschool, Birth–5 tracks. Instructor-led weekends.",
    href: "/cda",
    badge: "CDA",
  },
  {
    title: "Director Training",
    desc: "Focused live cohort for directors and owners.",
    href: "/director-training",
    badge: "Director",
  },
  {
    title: "Make & Take",
    desc: "Hands-on build sessions with instructors; materials you can take to your classroom.",
    href: "/make-and-take",
    badge: "Make & Take",
  },
];

export default function TrainingsPage() {
  return (
    <main className="page">
      <header className="section__header" style={{ marginBottom: 24 }}>
        <p className="eyebrow">Training</p>
        <h1>Instructor-led programs</h1>
        <p className="section__lede">
          CDA tracks, Director Training, and Make &amp; Take—all instructor-led. First class planned for January 23–25.
        </p>
      </header>

      <div className="grid-cards">
        {trainingLinks.map((item) => (
          <article className="card card--bordered" key={item.title}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3>{item.title}</h3>
              <span className="pill">{item.badge}</span>
            </div>
            <p className="section__lede">{item.desc}</p>
            <div style={{ marginTop: 12 }}>
              <Link className="btn-primary" href={item.href}>
                View {item.badge}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
