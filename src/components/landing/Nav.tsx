import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";

export function Nav() {
  return (
    <nav
      aria-label="Primary"
      className="flex items-center justify-between px-6 lg:px-10 py-5 relative z-10"
    >
      <Link href="/" aria-label="Crost Agency home">
        <Logo tone="light" width={130} />
      </Link>
      <div className="flex items-center gap-3">
        <ButtonLink
          href="/diagnostic"
          variant="inverse"
          size="nav"
          className="hidden sm:inline-flex"
        >
          Run the diagnostic
        </ButtonLink>
        <ButtonLink href="/apply" variant="primary" size="nav">
          Apply to Crost
        </ButtonLink>
      </div>
    </nav>
  );
}
