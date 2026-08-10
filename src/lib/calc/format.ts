const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatUsd(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "—";
  return usd.format(value);
}

export function formatRatio(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "—";
  return `${value.toFixed(1)}×`;
}

export function formatCount(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "—";
  return Math.round(value).toLocaleString("en-US");
}

export function formatPct(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "—";
  return `${value}%`;
}
