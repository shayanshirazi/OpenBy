import Link from "next/link";
import { Twitter, Github, Linkedin } from "lucide-react";

const PRODUCT_LINKS = [
  { label: "Price History", href: "/search?q=laptop" },
  { label: "AI Predictions", href: "/" },
  { label: "Best Deals", href: "/best-deals" },
  { label: "Chrome Extension", href: "/" },
];

const COMPANY_LINKS = [
  { label: "About", href: "/" },
  { label: "Careers", href: "/" },
  { label: "Blog", href: "/" },
  { label: "Contact", href: "/contact" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
  { label: "Cookie Policy", href: "/cookie-policy" },
];

const SOCIAL_ICONS = [
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Github, href: "https://github.com", label: "GitHub" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
];

function FooterColumn({
  header,
  links,
}: {
  header: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold text-zinc-900">{header}</h3>
      <ul className="space-y-3">
        {links.map(({ label, href }) => (
          <li key={label}>
            <Link
              href={href}
              className="text-sm text-zinc-600 transition-colors hover:text-zinc-900"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="relative border-t border-zinc-200/80 bg-gradient-to-b from-zinc-100 to-indigo-50/30">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_100%_60%_at_50%_100%,rgba(99,102,241,0.03),transparent)]" />
      <div className="relative mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <Link href="/" className="text-xl font-bold text-zinc-900">
              OpenBy
            </Link>
            <p className="text-sm text-zinc-600">
              AI-Powered Price Tracking.
            </p>
            <p className="text-xs text-zinc-500">
              © 2026 OpenBy. All rights reserved.
            </p>
            <div className="flex gap-4 pt-2">
              {SOCIAL_ICONS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-zinc-500 transition-colors hover:text-zinc-900"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Product */}
          <FooterColumn header="Features" links={PRODUCT_LINKS} />

          {/* Column 3: Company */}
          <FooterColumn header="Company" links={COMPANY_LINKS} />

          {/* Column 4: Legal */}
          <FooterColumn header="Legal" links={LEGAL_LINKS} />
        </div>
      </div>
    </footer>
  );
}
