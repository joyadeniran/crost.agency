/**
 * Hidden from real users via CSS, present in the DOM for bots that fill every
 * field.
 *
 * The field name matters: it was previously `company_website`, which is both a
 * plausible autofill target for password managers and a near-duplicate of the
 * real "Website" field on step 1 — a browser helpfully filling it would have
 * silently classified a genuine prospect as a bot. `referral_code_2` is
 * deliberately unattractive to autofill heuristics.
 */
export function Honeypot({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: "-9999px",
        width: "1px",
        height: "1px",
        overflow: "hidden",
      }}
    >
      <label htmlFor="referral_code_2">Referral code</label>
      <input
        id="referral_code_2"
        name="referral_code_2"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
