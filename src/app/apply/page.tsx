import type { Metadata } from "next";
import { ApplyForm } from "@/components/apply/ApplyForm";

export const metadata: Metadata = {
  title: "Apply to Crost",
  description: "Let's see if we can make the number real.",
};

export default async function ApplyPage(props: PageProps<"/apply">) {
  const params = await props.searchParams;
  const leadId = typeof params.lead === "string" ? params.lead : null;
  const diagnosticId =
    typeof params.diagnostic === "string" ? params.diagnostic : null;

  return <ApplyForm leadId={leadId} diagnosticId={diagnosticId} />;
}
