import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="page">
      <header className="section__header" style={{ marginBottom: 20 }}>
        <p className="eyebrow">Contact</p>
        <h1>Get in touch</h1>
        <p className="section__lede">
          We’re local to the Florida Panhandle and happy to help with CDA and director training questions.
        </p>
      </header>

      <div className="card" style={{ padding: 24, display: "grid", gap: 12 }}>
        <div>
          <h3 style={{ margin: "0 0 6px" }}>Email</h3>
          <p style={{ margin: 0 }}>
            <Link className="link" href="mailto:info@panhandlepathways.com">
              info@panhandlepathways.com
            </Link>{" "}
            (forwarding active for now)
          </p>
        </div>

        <div>
          <h3 style={{ margin: "0 0 6px" }}>What to include</h3>
          <ul className="feature-list" style={{ marginTop: 6 }}>
            <li>Your name and role (teacher, director, org admin)</li>
            <li>Which track: Infant/Toddler, Preschool, Birth–5 CDA, or Director Training</li>
            <li>Any dates you’re targeting (first class: Jan 23–25)</li>
            <li>Organization size if registering a team</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
