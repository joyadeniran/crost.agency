"use client";

import { useEffect, useRef, useState } from "react";

const EXAMPLES = [
  { value: "1,000", label: "NEW CUSTOMERS" },
  { value: "$100K", label: "REVENUE" },
  { value: "3.5×", label: "ROAS" },
  { value: "$20", label: "CAC" },
];

export function RotatingStat() {
  const [i, setI] = useState(0);
  const [visible, setVisible] = useState(true);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Honour the motion preference: cycling text is decorative, and swapping it
    // every 2.4s is exactly the kind of movement the preference exists to stop.
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;

    const interval = setInterval(() => {
      setVisible(false);
      // The previous implementation returned this timeout's cleanup from inside
      // setInterval, where nothing could call it — so a pending fade could fire
      // after unmount. Tracking it in a ref makes it genuinely cancellable.
      fadeTimer.current = setTimeout(() => {
        setI((n) => (n + 1) % EXAMPLES.length);
        setVisible(true);
      }, 220);
    }, 2400);

    return () => {
      clearInterval(interval);
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
    };
  }, []);

  const current = EXAMPLES[i];

  return (
    <div className="flex flex-col items-center lg:items-start">
      {/* One accessible label rather than four values announced in rotation. */}
      <span className="sr-only">
        Examples of outcomes Crost works to: new customers, revenue, ROAS, CAC.
      </span>
      <div
        aria-hidden="true"
        className="font-display font-semibold text-[56px] sm:text-[72px] leading-none text-crost-pink transition-opacity tabular-nums"
        style={{ opacity: visible ? 1 : 0, transitionDuration: "var(--dur-quick)" }}
      >
        {current.value}
      </div>
      <div
        aria-hidden="true"
        className="mt-2 font-text font-semibold text-[13px] tracking-[0.2em] text-text-inv-mid transition-opacity"
        style={{ opacity: visible ? 1 : 0, transitionDuration: "var(--dur-quick)" }}
      >
        {current.label}
      </div>
    </div>
  );
}
