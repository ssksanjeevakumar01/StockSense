import { Product, StockHealth } from "@/types";

/** Supplier lead time used when projecting replenishment needs. */
export const LEAD_TIME_DAYS = 14;

/** Extra buffer, expressed in days of average consumption. */
export const SAFETY_DAYS = 5;

/** At or below this many days of cover the item is flagged critical. */
export const CRITICAL_DAYS = 3;

/** At or below this many days of cover the item is flagged low. */
export const LOW_DAYS = 7;

/**
 * Days of stock left at the current burn rate.
 * Returns 0 when there is no stock and null when usage is unknown.
 */
export function daysRemaining(stock: number, averageDailyUsage?: number): number | null {
  if (!averageDailyUsage || averageDailyUsage <= 0) return null;
  return Math.max(0, stock / averageDailyUsage);
}

/** Formats a day count for display: `< 1 day`, `3 days`, `2.4 days`. */
export function formatDaysRemaining(days: number | null): string {
  if (days === null) return "No usage data";
  if (days === 0) return "Out of stock";
  if (days < 1) return "< 1 day";
  if (days < 10) return `${days.toFixed(1)} days`;
  return `${Math.round(days)} days`;
}

/**
 * Reorder quantity that restores lead-time cover plus a safety buffer,
 * rounded up to the nearest 10 units. Never returns a negative number.
 */
export function reorderSuggestion(
  stock: number,
  averageDailyUsage: number,
  reorderPoint: number
): number {
  const target = Math.max(
    reorderPoint,
    (averageDailyUsage || 0) * (LEAD_TIME_DAYS + SAFETY_DAYS)
  );
  if (stock >= target) return 0;
  return Math.ceil((target - stock) / 10) * 10;
}

/** Classifies a product's stock position. */
export function stockHealth(stock: number, product: Product): StockHealth {
  if (stock <= 0) return "out";
  if (stock <= product.reorder_point) return "low";
  const days = daysRemaining(stock, product.average_daily_usage);
  if (days !== null) {
    if (days <= CRITICAL_DAYS) return "critical";
    if (days <= LOW_DAYS) return "low";
  }
  return "healthy";
}

export const healthLabel: Record<StockHealth, string> = {
  healthy: "Healthy",
  low: "Low",
  critical: "Critical",
  out: "Out of stock",
};

/** Sort weight so the most urgent rows float to the top. */
export const healthWeight: Record<StockHealth, number> = {
  out: 0,
  critical: 1,
  low: 2,
  healthy: 3,
};

export const healthTone: Record<StockHealth, "red" | "amber" | "green"> = {
  out: "red",
  critical: "red",
  low: "amber",
  healthy: "green",
};

export const healthBar: Record<StockHealth, string> = {
  out: "bg-red-500",
  critical: "bg-red-500",
  low: "bg-amber-500",
  healthy: "bg-emerald-500",
};

/** Percentage of the reorder point currently on hand, capped at 100. */
export function reorderCoverage(stock: number, reorderPoint: number): number {
  if (reorderPoint <= 0) return 100;
  return Math.min(100, Math.round((stock / reorderPoint) * 100));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function startOfDay(reference: Date): number {
  const d = new Date(reference);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Inclusive start of the window `days` days wide, ending now. */
export function recentWindowStart(days: number, now = new Date()): number {
  return startOfDay(now) - (days - 1) * DAY_MS;
}

export function daysBetween(from: string | number, to: string | number = Date.now()): number {
  return Math.floor((new Date(to).getTime() - new Date(from).getTime()) / DAY_MS);
}
