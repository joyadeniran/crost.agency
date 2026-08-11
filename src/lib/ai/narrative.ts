import Anthropic from "@anthropic-ai/sdk";
import type { DiagnosticResult, GoalType } from "@/lib/calc/types";
import { formatCount, formatRatio, formatTimeframe, formatUsd } from "@/lib/calc/format";

/**
 * Deliberately narrow: this is the ONLY shape of data the model ever sees.
 * No raw form inputs, no ability to see or touch the calculation — it can
 * only phrase numbers that were already computed by engine.ts. If this
 * function's input type ever grows to include raw inputs, that's a sign
 * the isolation boundary the brief asked for is being violated.
 */
interface NarrativeFacts {
  goalType: GoalType;
  targetLabel: string;
  timeframe: string;
  estimatedMonthlyMediaRequired: string;
  ltvToCac: string;
  confidence: "HIGH" | "MEDIUM" | "NEEDS_MORE_DATA";
  /** False when the engine could not price the target at all. */
  priceable: boolean;
}

function factsFromResult(
  goalType: GoalType,
  timeframeDays: number,
  result: DiagnosticResult
): NarrativeFacts {
  const { outputs, confidence, priceable } = result;
  const targetLabel =
    goalType === "customers"
      ? `${formatCount(outputs.targetCustomers)} new customers`
      : goalType === "revenue"
        ? `${formatUsd(outputs.revenueTarget)} in revenue`
        : `${formatUsd(outputs.revenueTarget)} in revenue at the stated ROAS`;

  return {
    goalType,
    targetLabel,
    timeframe: formatTimeframe(timeframeDays),
    estimatedMonthlyMediaRequired: formatUsd(outputs.estimatedMonthlyMediaRequired),
    ltvToCac: formatRatio(outputs.ltvToCac),
    confidence,
    priceable,
  };
}

function templatedFallback(facts: NarrativeFacts): string {
  // When nothing could be priced there is no model to narrate. Saying so
  // plainly beats a sentence full of em dashes pretending to be analysis.
  if (!facts.priceable) {
    return [
      `We can't price this target yet — there isn't enough acquisition data to model what it would take.`,
      `Add the missing figures above and the model updates immediately.`,
      `A Crost strategist reviews every target before any performance commitment is made.`,
    ].join(" ");
  }

  const viability =
    facts.confidence === "HIGH"
      ? "commercially viable based on the numbers provided"
      : "directionally workable, though a couple of inputs were estimated rather than known";

  return [
    `Based on your current acquisition economics, your target of ${facts.targetLabel} over ${facts.timeframe} requires approximately ${facts.estimatedMonthlyMediaRequired} in monthly acquisition spend, at an LTV:CAC of ${facts.ltvToCac}.`,
    `That makes the target ${viability}.`,
    `The Crost team will validate the assumptions before agreeing to a performance commitment.`,
  ].join(" ");
}

const SYSTEM_PROMPT = `You write a short, plain-English summary for a marketing-agency growth diagnostic.

You are given ONLY already-computed facts. Do not calculate, estimate, or invent any number that is not in the facts you are given. If a value is "—" it is unknown; say it is unknown rather than substituting a figure.

Voice: confident and clear, no jargon, no exclamation marks, sentence case, no fluff. Address the reader as "you".

Write exactly 2-3 sentences. State the target and the monthly media figure, then whether it looks commercially viable given the confidence level:
- HIGH: viable on the numbers provided
- MEDIUM: directionally workable, some inputs estimated
- NEEDS_MORE_DATA: not yet priceable, and say plainly that more acquisition data is needed rather than implying a figure exists

End by noting that a Crost strategist validates every target before any commitment.

Output only the summary text, with no preamble, heading, or quotation marks.`;

export async function generateNarrative(
  goalType: GoalType,
  timeframeDays: number,
  result: DiagnosticResult
): Promise<string> {
  const facts = factsFromResult(goalType, timeframeDays, result);
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return templatedFallback(facts);
  }

  const anthropic = new Anthropic({ apiKey });

  try {
    const message = await anthropic.messages.create({
      model: "claude-opus-5",
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      // Two or three sentences over a fixed set of facts needs no deliberation.
      // Low effort keeps this well inside the request budget of a form submit,
      // which is the latency the prospect actually feels.
      output_config: { effort: "low" },
      messages: [
        {
          role: "user",
          content: `Facts:\n${JSON.stringify(facts, null, 2)}`,
        },
      ],
    });

    // A safety decline arrives as a normal 200 with an empty content array —
    // reading content[0] without this check throws on an otherwise fine request.
    if (message.stop_reason === "refusal") {
      console.warn("AI narrative declined by safety classifier, using template");
      return templatedFallback(facts);
    }

    const text = message.content
      .filter((b) => b.type === "text")
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim();

    return text || templatedFallback(facts);
  } catch (err) {
    console.error("AI narrative generation failed, using template fallback", err);
    return templatedFallback(facts);
  }
}
