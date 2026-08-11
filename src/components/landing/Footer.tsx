import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

const SOCIAL = [
  { href: "https://instagram.com/crost.agency", label: "Instagram" },
  { href: "https://linkedin.com/company/crost-agency", label: "LinkedIn" },
];

export function Footer() {
  return (
    <footer className="bg-surface-0 border-t border-border-subtle py-10 px-6 lg:px-10">
      <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <Link href="/" aria-label="Crost Agency home">
            <Logo tone="dark" width={130} />
          </Link>
          <div className="font-text text-[13px] text-text-low mt-2">
            Performance marketing. Lagos.
          </div>
        </div>

        <nav
          aria-label="Footer"
          className="flex flex-wrap gap-x-6 gap-y-2 font-text text-[13px] text-text-mid"
        >
          <Link href="/diagnostic" className="hover:text-crost-pink-700">
            Diagnostic
          </Link>
          <Link href="/apply" className="hover:text-crost-pink-700">
            Apply
          </Link>
          {SOCIAL.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              // noopener closes the reverse-tabnabbing hole that target=_blank
              // opens; noreferrer keeps our URLs out of their analytics.
              rel="noopener noreferrer"
              className="hover:text-crost-pink-700"
            >
              {s.label}
            </a>
          ))}
          <a href="mailto:hello@crost.agency" className="hover:text-crost-pink-700">
            Contact
          </a>
        </nav>

        <div className="font-text text-[12px] text-text-low">
          © {new Date().getFullYear()} Crost Agency.
        </div>
      </div>
    </footer>
  );
}
