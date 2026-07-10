// Money is integer cents from the backend (the source of truth). We only format
// for display — never rescale. Per the design brief §5 we show ₹ INR with en-IN grouping.
export function formatMoney(cents: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
