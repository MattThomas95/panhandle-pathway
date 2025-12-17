export default function WhyChooseUsPage() {
  const reasons = [
    {
      title: "Instructor-led only",
      body: "No self-paced tracks. Live weekends (Fri–Sun) with coaches who guide you through CDA and director programs.",
    },
    {
      title: "Local Florida Panhandle focus",
      body: "We’re local educators with compliance, staffing, and classroom context specific to our region.",
    },
    {
      title: "Supported online touchpoints",
      body: "Even online components are instructor-supported with check-ins, portfolio reviews, and practicum guidance.",
    },
    {
      title: "Org-friendly",
      body: "Invite teams, send signup links, and manage certifications from one place (org dashboard coming).",
    },
    {
      title: "Hands-on Make & Take",
      body: "Build classroom materials with instructors and take them back to your program.",
    },
  ];

  return (
    <main className="page">
      <header className="section__header" style={{ marginBottom: 24 }}>
        <p className="eyebrow">Why choose us</p>
        <h1>Panhandle Pathways Teacher Training Center LLC</h1>
        <p className="section__lede">
          Instructor-led CDA and director training for infant, toddler, and preschool teachers—local, supported, and
          built for teams.
        </p>
      </header>

      <div className="grid-cards">
        {reasons.map((item) => (
          <article className="card card--bordered" key={item.title}>
            <h3>{item.title}</h3>
            <p className="section__lede">{item.body}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
