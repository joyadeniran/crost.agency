"use client";

import { useEffect, useState } from "react";

const EXAMPLES = [
  { value: "1,000", label: "NEW USERS" },
  { value: "$100K", label: "REVENUE" },
  { value: "3.5×", label: "ROAS" },
  { value: "$20", label: "CAC" },
];

export function RotatingStat() {
  const [i, setI] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      const t = setTimeout(() => {
        setI((n) => (n + 1) % EXAMPLES.length);
        setVisible(true);
      }, 220);
      return () => clearTimeout(t);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  const current = EXAMPLES[i];

  return (
    <div className="flex flex-col items-center lg:items-start">
      <div
        className="font-display font-semibold text-[72px] leading-none text-crost-pink transition-opacity"
        style={{
          opacity: visible ? 1 : 0,
          transitionDuration: "var(--dur-quick)",
        }}
      >
        {current.value}
      </div>
      <div
        className="mt-2 font-text font-semibold text-[13px] tracking-[0.2em] text-text-inv-mid transition-opacity"
        style={{
          opacity: visible ? 1 : 0,
          transitionDuration: "var(--dur-quick)",
        }}
      >
        {current.label}
      </div>
    </div>
  );
}
