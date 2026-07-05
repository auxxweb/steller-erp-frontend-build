/**
 * Compute rental duration in whole days (minimum 1).
 */
export function computeDurationDays(startAt, endAt) {
  const start = new Date(startAt);
  const end = new Date(endAt);
  const ms = end.getTime() - start.getTime();
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return Math.max(1, days);
}

export function resolveUnitRate(pricing = {}, rateType = 'daily') {
  if (!pricing) return 0;
  const p =
    pricing.individual || pricing.combo ? pricing.individual || pricing.combo : pricing;
  switch (rateType) {
    case 'weekly':
      return p.weeklyRate ?? (p.dailyRate ? p.dailyRate * 7 : 0);
    case 'monthly':
      return p.monthlyRate ?? (p.dailyRate ? p.dailyRate * 30 : 0);
    case 'flat':
      return p.dailyRate ?? 0;
    case 'daily':
    default:
      return p.dailyRate ?? 0;
  }
}
