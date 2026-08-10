import { DailyRow } from "./csvParser";

export interface PeriodMetrics {
  totalLeads: number;
  totalCalls: number;
  totalWebsiteVisits: number;
  totalRevenue: number;
  conversionRate: number; // leads / website_visits * 100
}

export function computeMetrics(rows: DailyRow[]): PeriodMetrics {
  const totalLeads = rows.reduce((sum, r) => sum + r.leads, 0);
  const totalCalls = rows.reduce((sum, r) => sum + r.calls, 0);
  const totalWebsiteVisits = rows.reduce((sum, r) => sum + r.website_visits, 0);
  const totalRevenue = rows.reduce((sum, r) => sum + r.revenue, 0);
  const conversionRate = totalWebsiteVisits > 0 ? (totalLeads / totalWebsiteVisits) * 100 : 0;

  return { totalLeads, totalCalls, totalWebsiteVisits, totalRevenue, conversionRate };
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null; // null = "undefined" change (avoid divide-by-zero)
  return ((current - previous) / previous) * 100;
}

export const EMPTY_METRICS: PeriodMetrics = {
  totalLeads: 0,
  totalCalls: 0,
  totalWebsiteVisits: 0,
  totalRevenue: 0,
  conversionRate: 0,
};
