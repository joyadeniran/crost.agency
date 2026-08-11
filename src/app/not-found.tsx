import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Badge";
import { Logo } from "@/components/brand/Logo";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-crost-black text-white flex flex-col">
      <div className="px-6 py-5">
        <Link href="/" aria-label="Crost Agency home">
          <Logo tone="light" width={110} />
        </Link>
      </div>
      <main
        id="main"
        className="flex-1 flex items-center justify-center px-6 pb-20 text-center"
      >
        <div className="max-w-md flex flex-col items-center gap-5">
          <Eyebrow>404</Eyebrow>
          <h1 className="font-display font-semibold text-[36px] sm:text-[44px] leading-[1.05] tracking-[-0.02em]">
            That page doesn&rsquo;t exist.
          </h1>
          <p className="font-text text-[16px] leading-relaxed text-text-inv-mid">
            The link may be old, or the address slightly off. The diagnostic is
            the fastest way back in.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            <ButtonLink href="/diagnostic" variant="gradient" size="lg">
              Run the diagnostic →
            </ButtonLink>
            <ButtonLink href="/" variant="inverse" size="lg">
              Back to home
            </ButtonLink>
          </div>
        </div>
      </main>
    </div>
  );
}
