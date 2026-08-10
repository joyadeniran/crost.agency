import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export function Nav() {
  return (
    <div className="flex items-center justify-between px-6 lg:px-10 py-5 relative z-10">
      <Link href="/">
        <Logo fill="#FFFFFF" width={130} />
      </Link>
      <div className="flex items-center gap-3">
        <Link
          href="/diagnostic"
          className="hidden sm:inline-flex h-10 items-center px-4 rounded-md border-[1.5px] border-white/30 text-white font-text font-semibold text-[13px] hover:bg-white hover:text-crost-black transition-colors duration-[var(--dur-quick)]"
        >
          Run the diagnostic
        </Link>
        <Link
          href="/apply"
          className="inline-flex h-10 items-center px-4 rounded-md bg-crost-pink text-crost-black font-text font-semibold text-[13px] hover:bg-[#D920AF] transition-colors duration-[var(--dur-quick)]"
        >
          Apply to Crost
        </Link>
      </div>
    </div>
  );
}
