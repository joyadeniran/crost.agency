export type AnalyticsEvent =
  | "diagnostic_started"
  | "diagnostic_step_completed"
  | "diagnostic_completed"
  | "diagnostic_resumed"
  | "diagnostic_abandoned_edit"
  | "result_viewed"
  | "application_started"
  | "application_completed"
  | "cta_clicked";

export function track(
  eventName: AnalyticsEvent,
  properties?: Record<string, unknown>,
  leadId?: string | null
) {
  if (typeof window === "undefined") return;

  const payload = JSON.stringify({
    eventName,
    properties: properties ?? null,
    leadId: leadId ?? null,
  });
  const url = "/api/analytics";

  // Fire-and-forget — never block the UI on analytics.
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }));
      return;
    }
  } catch {
    // Some browsers throw from sendBeacon under strict privacy settings.
    // Fall through to fetch rather than letting it break the caller.
  }

  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {});
}
