// ─── Pure billing / commission math (no DB) — shared by controller + tests ───
export const commissionFor = (amount, pct) => Math.round((Number(amount) || 0) * (Number(pct) || 0) / 100);

export const currentPeriod = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
export const inPeriod = (date, period) => currentPeriod(new Date(date)) === period;

// Monthly recurring revenue from active/trialing subscriptions.
export const mrr = (subs = []) =>
  subs.filter((s) => ["active", "trialing"].includes(s.status)).reduce((a, s) => a + (Number(s.amount) || 0), 0);

// Roll up successful transactions.
export const summarizeRevenue = (txns = []) => {
  const ok = txns.filter((t) => t.status === "success");
  return {
    gross: ok.reduce((a, t) => a + (Number(t.amount) || 0), 0),
    commission: ok.reduce((a, t) => a + (Number(t.commission) || 0), 0),
    count: ok.length,
  };
};

// Reseller payout for a month = commission on successful txns that period.
export const buildPayout = (txns = [], period, pct = 0) => {
  const rows = txns.filter((t) => t.status === "success" && inPeriod(t.date, period));
  return {
    period,
    gross: rows.reduce((a, t) => a + (Number(t.amount) || 0), 0),
    amount: rows.reduce((a, t) => a + (Number(t.commission) || commissionFor(t.amount, pct)), 0),
    count: rows.length,
  };
};
