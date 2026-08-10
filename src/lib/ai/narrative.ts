import Anthropic from "@anthropic-ai/sdk";
import type { DiagnosticResult, GoalType } from "@/lib/calc/types";
import { formatCount, formatRatio, formatUsd } from "@/lib/calc/format";

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
  timeframeDays: number;
  estimatedMonthlyMediaRequired: string;
  ltvToCac: string;
  confidence: "HIGH" | "MEDIUM" | "NEEDS_MORE_DATA";
}

function factsFromResult(goalType: GoalType, timeframeDays: number, result: DiagnosticResult): NarrativeFacts {
  const { outputs, confidence } = result;
  const targetLabel =
    goalType === "customers"
      ? `${formatCount(outputs.targetCustomers)} new customers`
      : goalType === "revenue"
        ? `${formatUsd(outputs.revenueTarget)} in revenue`
        : `${formatUsd(outputs.revenueTarget)} in revenue at the stated ROAS`;

  return {
    goalType,
    targetLabel,
    timeframeDays,
    estimatedMonthlyMediaRequired: formatUsd(outputs.estimatedMonthlyMediaRequired),
    ltvToCac: formatRatio(outputs.ltvToCac),
    confidence,
  };
}

function templatedFallback(facts: NarrativeFacts): string {
  const viability =
    facts.confidence === "HIGH"
      ? "commercially viable based on the numbers provided"
      : facts.confidence === "MEDIUM"
        ? "directionally workable, though a couple of inputs were estimated rather than known"
        : "not yet priceable — there isn't enough acquisition data to model it responsibly";

  return [
    `Based on your current acquisition economics, your target of ${facts.targetLabel} over ${facts.timeframeDays} days requires approximately ${facts.estimatedMonthlyMediaRequired} in monthly acquisition spend, at an LTV:CAC of ${facts.ltvToCac}.`,
    `That makes the target ${viability}.`,
    `The Crost team will validate the assumptions before agreeing to a performance commitment.`,
  ].join(" ");
}

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
  const prompt = `You write a short, plain-English summary for a marketing-agency growth diagnostic. You are given ONLY these already-computed facts — do not calculate, estimate, or invent any number not listed here:

${JSON.stringify(facts, null, 2)}

Write exactly 2-3 sentences, in Crost's voice: confident and clear, no jargon, no exclamation marks, sentence case, no fluff. State the target, the monthly media figure, and whether it looks commercially viable given the confidence level (HIGH = viable, MEDIUM = directionally workable with estimated inputs, NEEDS_MORE_DATA = not yet priceable). End by noting a Crost strategist validates every target before any commitment. Output only the summary text, nothing else.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });
    const block = message.content.find((b) => b.type === "text");
    if (block && block.type === "text" && block.text.trim()) {
      return block.text.trim();
    }
    return templatedFallback(facts);
  } catch (err) {
    console.error("AI narrative generation failed, using template fallback", err);
    return templatedFallback(facts);
  }
}
