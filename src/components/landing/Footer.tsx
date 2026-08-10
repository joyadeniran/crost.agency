import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";

export function Footer() {
  return (
    <footer className="bg-surface-0 border-t border-[#E4E7EC] py-10 px-6 lg:px-10">
      <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <Wordmark dark={false} />
          <div className="font-text text-[13px] text-text-low mt-2">
            Performance marketing.
          </div>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 font-text text-[13px] text-text-mid">
          <Link href="/diagnostic" className="hover:text-crost-pink-700">
            Diagnostic
          </Link>
          <Link href="/apply" className="hover:text-crost-pink-700">
            Apply
          </Link>
          <a
            href="https://instagram.com/crost.agency"
            className="hover:text-crost-pink-700"
          >
            Instagram
          </a>
          <a
            href="https://linkedin.com/company/crost-agency"
            className="hover:text-crost-pink-700"
          >
            LinkedIn
          </a>
          <a href="mailto:hello@crost.agency" className="hover:text-crost-pink-700">
            Contact
          </a>
        </nav>
        <div className="font-text text-[12px] text-text-low">© 2026 Crost Agency.</div>
      </div>
    </footer>
  );
}
