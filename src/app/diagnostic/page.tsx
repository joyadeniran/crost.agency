import type { Metadata } from "next";
import { DiagnosticWizard } from "@/components/diagnostic/DiagnosticWizard";

export const metadata: Metadata = {
  title: "Crost Diagnostic — What's the number?",
  description: "See what your current economics can support before you talk to us.",
};

export default function DiagnosticPage() {
  return <DiagnosticWizard />;
}
