// Airbnb-style rating format: at least one decimal, trailing zero trimmed.
// 5 → "5.0", 4.9 → "4.9", 4.97 → "4.97".
export function formatRating(value: number): string {
  const s = value.toFixed(2);
  return s.endsWith("0") ? s.slice(0, -1) : s;
}
