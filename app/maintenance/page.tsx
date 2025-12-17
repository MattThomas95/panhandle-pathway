import Link from "next/link";

export const metadata = {
  title: "Under Development | Panhandle Pathways Teacher Training Center LLC",
};

export default function MaintenancePage() {
  return (
    <main className="page">
      <div className="card" style={{ padding: 32, textAlign: "center", display: "grid", gap: 12 }}>
        <span className="pill" style={{ margin: "0 auto" }}>
          Under Development
        </span>
        <h1 style={{ margin: "4px 0 0" }}>We&apos;re getting the classroom ready</h1>
        <p className="section__lede" style={{ margin: "0 auto", maxWidth: 620 }}>
          The site is temporarily locked while we finish the instructor-led CDA and director training experience.
          First class is planned for January 23–25. Check back soon or reach out if you need anything in the meantime.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
          <Link className="btn-primary" href="mailto:info@panhandlepathways.com">
            Email us
          </Link>
          <Link className="btn-ghost" href="/faq">
            View FAQ
          </Link>
        </div>
        <div className="card card--bordered" style={{ marginTop: 12 }}>
          <h3 style={{ marginTop: 0 }}>What to expect</h3>
          <ul className="feature-list">
            <li>Instructor-led courses for infant, toddler, and preschool certificates</li>
            <li>Local to the Florida Panhandle</li>
            <li>Organization support with invites and certificates coming soon</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
