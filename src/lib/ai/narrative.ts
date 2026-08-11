import { GoogleGenAI, ThinkingLevel, FinishReason } from "@google/genai";
import type { DiagnosticResult, GoalType } from "@/lib/calc/types";
import { formatCount, formatRatio, formatTimeframe, formatUsd } from "@/lib/calc/format";

/**
 * Deliberately narrow: this is the ONLY shape of data the model ever sees.
 * No raw form inputs, no ability to see or touch the calculation — it can
 * only phrase numbers that were already computed by engine.ts. If this
 * interface ever grows to include raw inputs, that's a sign the isolation
 * boundary the brief asked for is being violated. See SPEC section 3.4.
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

/**
 * Overridable so the model can be swapped without a deploy of this file —
 * the default is a preview model, and preview models get superseded.
 */
const MODEL = process.env.GEMINI_MODEL?.trim() || "gemini-3-flash-preview";

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

const SYSTEM_INSTRUCTION = `You write a short, plain-English summary for a marketing-agency growth diagnostic.

You are given ONLY already-computed facts. Do not calculate, estimate, or invent any number that is not in the facts you are given. If a value is "—" it is unknown; say it is unknown rather than substituting a figure.

Voice: confident and clear, no jargon, no exclamation marks, sentence case, no fluff. Address the reader as "you".

Write exactly 2-3 sentences. State the target and the monthly media figure, then whether it looks commercially viable given the confidence level:
- HIGH: viable on the numbers provided
- MEDIUM: directionally workable, some inputs estimated
- NEEDS_MORE_DATA: not yet priceable, and say plainly that more acquisition data is needed rather than implying a figure exists

End by noting that a Crost strategist validates every target before any commitment.

Output only the summary text as plain prose. No preamble, no heading, no markdown, no quotation marks.`;

/**
 * Thinking depth, matched to the configured model.
 *
 * This is derived rather than hardcoded because the parameters are not
 * interchangeable across model families: `thinkingLevel` belongs to Gemini 3,
 * `thinkingBudget` to Gemini 2.5, and MINIMAL is Gemini 3 Flash only. Sending
 * the wrong one is a 400 — which this module would swallow into the template
 * fallback, so the AI narrative would quietly stop working with nothing in the
 * UI to show for it. Anything unrecognised gets no thinking config at all.
 */
function thinkingConfigFor(model: string) {
  if (model.startsWith("gemini-3-flash")) {
    // Two or three sentences over a fixed set of facts needs no deliberation,
    // and this call sits inside a form submit the prospect is waiting on.
    return { thinkingLevel: ThinkingLevel.MINIMAL };
  }
  if (model.startsWith("gemini-3")) {
    return { thinkingLevel: ThinkingLevel.LOW };
  }
  if (model.startsWith("gemini-2.5-flash")) {
    return { thinkingBudget: 0 };
  }
  // gemini-2.5-pro cannot disable thinking, and older models reject the
  // parameter outright.
  return undefined;
}

export async function generateNarrative(
  goalType: GoalType,
  timeframeDays: number,
  result: DiagnosticResult
): Promise<string> {
  const facts = factsFromResult(goalType, timeframeDays, result);
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return templatedFallback(facts);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const thinkingConfig = thinkingConfigFor(MODEL);

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `Facts:\n${JSON.stringify(facts, null, 2)}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        ...(thinkingConfig ? { thinkingConfig } : {}),
      },
    });

    // A blocked prompt or a candidate stopped for safety both come back as a
    // successful call with no usable text, so `response.text` has to be
    // checked rather than assumed.
    if (response.promptFeedback?.blockReason) {
      console.warn(
        `Gemini blocked the narrative prompt (${response.promptFeedback.blockReason}); using template`
      );
      return templatedFallback(facts);
    }

    const finishReason = response.candidates?.[0]?.finishReason;
    if (finishReason && finishReason !== FinishReason.STOP) {
      console.warn(`Gemini narrative ended as ${finishReason}; using template`);
      return templatedFallback(facts);
    }

    return response.text?.trim() || templatedFallback(facts);
  } catch (err) {
    console.error("AI narrative generation failed, using template fallback", err);
    return templatedFallback(facts);
  }
}
