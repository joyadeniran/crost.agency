import type { Metadata } from "next";
import { ApplyForm } from "@/components/apply/ApplyForm";
import { loadDiagnosticContext } from "@/lib/leads";

export const metadata: Metadata = {
  title: "Apply to Crost",
  description:
    "Tell us the outcome you're chasing. A Crost strategist reviews every application.",
};

export default async function ApplyPage(props: PageProps<"/apply">) {
  const params = await props.searchParams;
  const leadParam = typeof params.lead === "string" ? params.lead : null;
  const diagnosticParam =
    typeof params.diagnostic === "string" ? params.diagnostic : null;

  // Resolves to null for a stale, mistyped or absent link. That is not an
  // error state: the form simply asks for the two details it would otherwise
  // have had, so an "Apply to Crost" click from anywhere on the site works.
  const context = await loadDiagnosticContext(leadParam, diagnosticParam);

  return <ApplyForm context={context} />;
}
