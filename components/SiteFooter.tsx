import Link from "next/link";
import { GraduationCap, BookOpen, Scissors, Mail, HelpCircle } from "lucide-react";

const footerLinks = [
  {
    title: "Programs",
    links: [
      { label: "CDA Training", href: "/cda", icon: GraduationCap },
      { label: "Director Training", href: "/director-training", icon: BookOpen },
      { label: "Make & Take", href: "/make-and-take", icon: Scissors },
      { label: "All Trainings", href: "/trainings" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Store", href: "/store" },
      { label: "Book Training", href: "/book" },
      { label: "Why Choose Us", href: "/why-choose-us" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "FAQ", href: "/faq", icon: HelpCircle },
      { label: "Contact Us", href: "/contact", icon: Mail },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-[var(--blue-900)] text-white mt-20">
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <h4 className="text-white font-bold text-lg mb-3">Panhandle Pathways</h4>
            <p className="text-sm text-white/60 leading-relaxed">
              Instructor-led CDA and director training for Florida&apos;s childcare educators. Local. Supported. Effective.
            </p>
          </div>

          {/* Link columns */}
          {footerLinks.map((col) => (
            <div key={col.title}>
              <h5 className="text-white/80 text-xs font-bold uppercase tracking-widest mb-4">
                {col.title}
              </h5>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} Panhandle Pathways Teacher Training Center LLC. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/contact" className="text-xs text-white/40 hover:text-white/70 transition-colors">
              Contact
            </Link>
            <Link href="/faq" className="text-xs text-white/40 hover:text-white/70 transition-colors">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
