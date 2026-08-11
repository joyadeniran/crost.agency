"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Badge";
import { Logo } from "@/components/brand/Logo";

/**
 * Next 16 passes `retry` (not `reset`) to error boundaries. It re-renders the
 * segment in place, which recovers transient failures without a full reload.
 */
export default function ErrorBoundary({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error boundary", error);
  }, [error]);

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
          <Eyebrow>SOMETHING BROKE</Eyebrow>
          <h1 className="font-display font-semibold text-[32px] sm:text-[40px] leading-[1.05] tracking-[-0.02em]">
            That didn&rsquo;t work.
          </h1>
          <p className="font-text text-[16px] leading-relaxed text-text-inv-mid">
            An unexpected error stopped this page loading. Trying again usually
            clears it — if it doesn&rsquo;t, email us and we&rsquo;ll pick it up
            directly.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            <Button variant="primary" size="lg" onClick={() => retry()}>
              Try again
            </Button>
            <ButtonLink href="/" variant="inverse" size="lg">
              Back to home
            </ButtonLink>
          </div>
          <a
            href="mailto:hello@crost.agency"
            className="font-text text-[13px] text-crost-pink mt-2"
          >
            hello@crost.agency
          </a>
          {error.digest && (
            <p className="font-mono text-[11px] text-text-inv-low">
              Reference: {error.digest}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
