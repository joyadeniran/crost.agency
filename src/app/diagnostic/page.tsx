import type { Metadata } from "next";
import { DiagnosticWizard } from "@/components/diagnostic/DiagnosticWizard";

export const metadata: Metadata = {
  title: "The Crost Diagnostic",
  description:
    "See what your current economics can support before you talk to us. Free, about three minutes, and it shows its working.",
  alternates: { canonical: "/diagnostic" },
  openGraph: {
    title: "The Crost Diagnostic — What's the number?",
    description:
      "See what your current economics can support before you talk to us.",
    url: "/diagnostic",
  },
};

export default function DiagnosticPage() {
  return <DiagnosticWizard />;
}
