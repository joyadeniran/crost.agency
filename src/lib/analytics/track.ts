export type AnalyticsEvent =
  | "diagnostic_started"
  | "diagnostic_step_completed"
  | "diagnostic_completed"
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
  const payload = JSON.stringify({ eventName, properties, leadId: leadId ?? null });
  // Fire-and-forget — never block the UI on analytics.
  const url = "/api/analytics";
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }));
    return;
  }
  fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true }).catch(
    () => {}
  );
}
