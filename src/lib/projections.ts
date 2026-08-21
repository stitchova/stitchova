import type { Order } from "@/contexts/AtelierContext";

export interface MonthBucket {
  key: string;       // "2026-03"
  label: string;      // "Mar"
  revenue: number;
  completedOrders: number;
}

export interface ProjectedMonth {
  key: string;
  label: string;
  revenue: number;
  completedOrders: number;
}

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const monthLabel = (d: Date) => d.toLocaleDateString(undefined, { month: "short" });

/**
 * Buckets real revenue (from order.payments) and real completed-order counts
 * (from the timestamp an order actually reached its final stage, via
 * order.stageHistory — falling back to order.createdAt only if that history
 * isn't available) into calendar months, sorted chronologically. No mock or
 * placeholder data — this reads directly from AtelierContext's orders.
 */
export function bucketOrdersByMonth(orders: Order[]): MonthBucket[] {
  const buckets = new Map<string, MonthBucket>();

  const touch = (dateInput: string | number) => {
    const d = new Date(dateInput);
    if (Number.isNaN(d.getTime())) return null;
    const key = monthKey(d);
    if (!buckets.has(key)) {
      buckets.set(key, { key, label: monthLabel(d), revenue: 0, completedOrders: 0 });
    }
    return buckets.get(key)!;
  };

  for (const o of orders) {
    // Revenue: every real payment actually recorded against this order.
    for (const p of o.payments || []) {
      const b = touch(p.date);
      if (b) b.revenue += p.amount;
    }

    // Completed work: use the timestamp the order actually reached its
    // final stage if we have stage history; otherwise fall back to
    // createdAt so the order still counts somewhere.
    if (o.status === "completed") {
      const finalStageIdx = (o.stages?.length || 1) - 1;
      const completionEntry = (o.stageHistory || []).find((h) => h.stageIdx === finalStageIdx);
      const b = touch(completionEntry ? completionEntry.timestamp : o.createdAt);
      if (b) b.completedOrders += 1;
    }
  }

  return Array.from(buckets.values()).sort((a, b) => a.key.localeCompare(b.key));
}

/**
 * Simple least-squares linear regression projected forward `monthsAhead`
 * months. Deliberately simple and explainable (a straight trend line
 * through actual monthly totals) rather than a black-box model — this is a
 * small-business tool, not a hedge fund, and a designer needs to be able to
 * see *why* the projection says what it says.
 */
function linearProject(values: number[], monthsAhead: number): number[] {
  const n = values.length;
  if (n === 0) return Array(monthsAhead).fill(0);
  if (n === 1) return Array(monthsAhead).fill(Math.max(0, values[0]));

  const xs = values.map((_, i) => i);
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = values.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (values[i] - meanY);
    den += (xs[i] - meanX) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const intercept = meanY - slope * meanX;

  const out: number[] = [];
  for (let i = 1; i <= monthsAhead; i++) {
    out.push(Math.max(0, Math.round(intercept + slope * (n - 1 + i))));
  }
  return out;
}

export interface ProjectionResult {
  history: MonthBucket[];
  projected: ProjectedMonth[];
  avgMonthlyGrowthPct: number | null; // null when there isn't enough history to compute it
  hasEnoughData: boolean;
}

export function projectRevenue(orders: Order[], monthsAhead = 1): ProjectionResult {
  const history = bucketOrdersByMonth(orders);
  const hasEnoughData = history.length >= 2;

  if (!hasEnoughData) {
    return { history, projected: [], avgMonthlyGrowthPct: null, hasEnoughData };
  }

  const revenueSeries = history.map((h) => h.revenue);
  const orderSeries = history.map((h) => h.completedOrders);
  const projRevenue = linearProject(revenueSeries, monthsAhead);
  const projOrders = linearProject(orderSeries, monthsAhead);

  // Rolling forward from the last real calendar month in the data.
  const lastDate = new Date(`${history[history.length - 1].key}-01T00:00:00`);
  const projected: ProjectedMonth[] = projRevenue.map((revenue, i) => {
    const d = new Date(lastDate);
    d.setMonth(d.getMonth() + i + 1);
    return { key: monthKey(d), label: monthLabel(d), revenue, completedOrders: projOrders[i] };
  });

  // Average month-over-month % growth across the real history, for a
  // simple, plain-English number alongside the chart.
  let growthSum = 0, growthCount = 0;
  for (let i = 1; i < revenueSeries.length; i++) {
    if (revenueSeries[i - 1] > 0) {
      growthSum += (revenueSeries[i] - revenueSeries[i - 1]) / revenueSeries[i - 1];
      growthCount++;
    }
  }
  const avgMonthlyGrowthPct = growthCount > 0 ? Math.round((growthSum / growthCount) * 1000) / 10 : null;

  return { history, projected, avgMonthlyGrowthPct, hasEnoughData };
}
