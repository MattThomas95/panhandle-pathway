export default function FaqPage() {
  const faqs = [
    {
      q: "Who are Panhandle Pathways Teacher Training Center LLC?",
      a: "We’re local childcare educators in the Florida Panhandle offering instructor-led CDA and director training.",
    },
    {
      q: "Is the training instructor-led or self-paced?",
      a: "Instructor-led only. Even online components are supported by instructors with live touchpoints.",
    },
    {
      q: "When is the next class?",
      a: "We’re targeting January 23–25 for the first class. Additional cohorts follow the Friday–Sunday format.",
    },
    {
      q: "Which CDA tracks do you offer?",
      a: "Infant/Toddler, Preschool, and Birth–5 CDA, all instructor-led with portfolio and practicum support.",
    },
    {
      q: "Do you support organizations and teams?",
      a: "Yes. Organizations can register multiple teachers, send invites, and manage certifications in one dashboard.",
    },
    {
      q: "What should I bring?",
      a: "A can-do attitude, readiness to learn, and anything your instructor requests. We’ll guide you on materials.",
    },
    {
      q: "Can I get a certificate?",
      a: "Yes. Certificates are added to your account; admins can bulk upload per class date.",
    },
  ];

  return (
    <main className="page">
      <header className="section__header" style={{ marginBottom: 24 }}>
        <p className="eyebrow">FAQ</p>
        <h1>Common questions</h1>
        <p className="section__lede">
          Instructor-led CDA and director training, local to the Florida Panhandle. Here’s what people ask most.
        </p>
      </header>

      <div className="card" style={{ padding: 24, display: "grid", gap: 16 }}>
        {faqs.map((item) => (
          <div key={item.q} style={{ borderBottom: "1px solid rgba(14,47,74,0.08)", paddingBottom: 12 }}>
            <h3 style={{ margin: "0 0 6px" }}>{item.q}</h3>
            <p style={{ margin: 0 }}>{item.a}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
