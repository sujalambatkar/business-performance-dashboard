import { DailyRow } from "./csvParser";
import { PeriodMetrics, percentChange } from "./metrics";

export interface Insight {
  id: string;
  tone: "positive" | "negative" | "neutral";
  text: string;
}

// Thresholds are intentionally simple constants so they're easy to explain/tune.
const CONVERSION_RATE_LOW_THRESHOLD = 2; // %
const CONVERSION_RATE_HIGH_THRESHOLD = 8; // %
const CALLS_TO_LEADS_GAP_THRESHOLD = 0.5; // calls per lead considered "low follow-up"
const LARGE_CHANGE_THRESHOLD = 15; // % change considered "notable"

/**
 * Pure, rule-based analysis of the parsed CSV data. No external AI calls —
 * every rule below is a simple, explainable comparison against the numbers.
 */
export function generateInsights(
  currentRows: DailyRow[],
  currentMetrics: PeriodMetrics,
  previousMetrics: PeriodMetrics | null
): Insight[] {
  const insights: Insight[] = [];

  // Rule 1: Largest % change vs previous period, across the 5 core metrics.
  if (previousMetrics) {
    const comparisons: { label: string; current: number; previous: number }[] = [
      { label: "Total Leads", current: currentMetrics.totalLeads, previous: previousMetrics.totalLeads },
      { label: "Total Calls", current: currentMetrics.totalCalls, previous: previousMetrics.totalCalls },
      { label: "Website Visits", current: currentMetrics.totalWebsiteVisits, previous: previousMetrics.totalWebsiteVisits },
      { label: "Revenue", current: currentMetrics.totalRevenue, previous: previousMetrics.totalRevenue },
      { label: "Conversion Rate", current: currentMetrics.conversionRate, previous: previousMetrics.conversionRate },
    ];

    let biggest: { label: string; change: number } | null = null;
    for (const c of comparisons) {
      const change = percentChange(c.current, c.previous);
      if (change === null) continue;
      if (!biggest || Math.abs(change) > Math.abs(biggest.change)) {
        biggest = { label: c.label, change };
      }
    }

    if (biggest && Math.abs(biggest.change) >= LARGE_CHANGE_THRESHOLD) {
      const direction = biggest.change > 0 ? "increased" : "decreased";
      insights.push({
        id: "largest-change",
        tone: biggest.change > 0 ? "positive" : "negative",
        text: `${biggest.label} ${direction} the most vs. the previous period, by ${Math.abs(biggest.change).toFixed(1)}%.`,
      });
    }
  }

  // Rule 2: Conversion rate sanity check against fixed thresholds.
  if (currentMetrics.conversionRate < CONVERSION_RATE_LOW_THRESHOLD) {
    insights.push({
      id: "conversion-low",
      tone: "negative",
      text: `Conversion rate is ${currentMetrics.conversionRate.toFixed(1)}%, below the ${CONVERSION_RATE_LOW_THRESHOLD}% healthy threshold — website traffic isn't converting well into leads.`,
    });
  } else if (currentMetrics.conversionRate > CONVERSION_RATE_HIGH_THRESHOLD) {
    insights.push({
      id: "conversion-high",
      tone: "positive",
      text: `Conversion rate is ${currentMetrics.conversionRate.toFixed(1)}%, above the ${CONVERSION_RATE_HIGH_THRESHOLD}% mark — website traffic is converting very well.`,
    });
  }

  // Rule 3: Revenue per lead — flag if unusually high or low relative to overall average.
  if (currentMetrics.totalLeads > 0) {
    const revenuePerLead = currentMetrics.totalRevenue / currentMetrics.totalLeads;
    const dailyRevenuePerLead = currentRows
      .filter((r) => r.leads > 0)
      .map((r) => r.revenue / r.leads);

    if (dailyRevenuePerLead.length > 1) {
      const avg = dailyRevenuePerLead.reduce((a, b) => a + b, 0) / dailyRevenuePerLead.length;
      const variance =
        dailyRevenuePerLead.reduce((a, b) => a + (b - avg) ** 2, 0) / dailyRevenuePerLead.length;
      const stdDev = Math.sqrt(variance);

      if (stdDev > 0 && Math.abs(revenuePerLead - avg) > stdDev) {
        const direction = revenuePerLead > avg ? "higher" : "lower";
        insights.push({
          id: "revenue-per-lead",
          tone: revenuePerLead > avg ? "positive" : "negative",
          text: `Revenue per lead ($${revenuePerLead.toFixed(2)}) is notably ${direction} than the period's daily average ($${avg.toFixed(2)}).`,
        });
      }
    }
  }

  // Rule 4: Best / worst performing day, ranked by revenue.
  if (currentRows.length > 1) {
    const sorted = [...currentRows].sort((a, b) => b.revenue - a.revenue);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    if (best.date !== worst.date) {
      insights.push({
        id: "best-worst-day",
        tone: "neutral",
        text: `Best day was ${best.date} ($${best.revenue.toLocaleString()} revenue); worst day was ${worst.date} ($${worst.revenue.toLocaleString()} revenue).`,
      });
    }
  }

  // Rule 5: Calls-to-leads ratio — low ratio suggests leads aren't being followed up with calls.
  if (currentMetrics.totalLeads > 0) {
    const callsToLeadsRatio = currentMetrics.totalCalls / currentMetrics.totalLeads;
    if (callsToLeadsRatio < CALLS_TO_LEADS_GAP_THRESHOLD) {
      insights.push({
        id: "calls-to-leads-gap",
        tone: "negative",
        text: `Only ${callsToLeadsRatio.toFixed(2)} calls per lead — this suggests a possible follow-up gap in the sales process.`,
      });
    }
  }

  // Fallback so the section is never empty.
  if (insights.length === 0) {
    insights.push({
      id: "steady",
      tone: "neutral",
      text: "Metrics look steady — no notable outliers detected in this period.",
    });
  }

  return insights.slice(0, 5);
}
