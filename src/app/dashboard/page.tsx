"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import UploadSlot from "@/components/UploadSlot";
import MetricCard from "@/components/MetricCard";
import TimeSeriesChart from "@/components/TimeSeriesChart";
import ComparisonChart from "@/components/ComparisonChart";
import InsightsCard from "@/components/InsightsCard";
import { DailyRow } from "@/lib/csvParser";
import { computeMetrics, EMPTY_METRICS } from "@/lib/metrics";
import { generateInsights } from "@/lib/insights";
import { downloadSampleCsv } from "@/lib/sampleCsv";

export default function DashboardPage() {
  const router = useRouter();
  const [currentRows, setCurrentRows] = useState<DailyRow[]>([]);
  const [previousRows, setPreviousRows] = useState<DailyRow[]>([]);

  const currentMetrics = useMemo(
    () => (currentRows.length > 0 ? computeMetrics(currentRows) : EMPTY_METRICS),
    [currentRows]
  );
  const previousMetrics = useMemo(
    () => (previousRows.length > 0 ? computeMetrics(previousRows) : null),
    [previousRows]
  );

  const hasCurrent = currentRows.length > 0;
  const hasComparison = hasCurrent && previousRows.length > 0;

  const insights = useMemo(
    () => (hasCurrent ? generateInsights(currentRows, currentMetrics, previousMetrics) : []),
    [hasCurrent, currentRows, currentMetrics, previousMetrics]
  );

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    localStorage.removeItem("bpd_authed");
    router.push("/login");
    router.refresh();
  }

  const fmtCurrency = (n: number) =>
    n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const fmtNumber = (n: number) => n.toLocaleString();
  const fmtPercent = (n: number) => `${n.toFixed(1)}%`;

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <h1 className="text-lg font-semibold text-slate-900">Business Performance Dashboard</h1>
          <button
            onClick={handleLogout}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        {/* Upload section */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <UploadSlot
            label="Current Period CSV"
            onParsed={(rows) => setCurrentRows(rows)}
            onClear={() => setCurrentRows([])}
          />
          <UploadSlot
            label="Previous Period CSV (optional, for comparison)"
            onParsed={(rows) => setPreviousRows(rows)}
            onClear={() => setPreviousRows([])}
          />
        </section>

        <div>
          <button
            onClick={downloadSampleCsv}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
          >
            Download Sample CSV
          </button>
        </div>

        {!hasCurrent && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="text-sm text-slate-500">
              Upload a Current Period CSV to see your metrics. Expected columns: date, leads,
              calls, website_visits, revenue.
            </p>
          </div>
        )}

        {/* Metric cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard
            label="Total Leads"
            value={fmtNumber(currentMetrics.totalLeads)}
            previousValue={previousMetrics ? fmtNumber(previousMetrics.totalLeads) : undefined}
            current={currentMetrics.totalLeads}
            previous={previousMetrics?.totalLeads}
            hasComparison={hasComparison}
          />
          <MetricCard
            label="Total Calls"
            value={fmtNumber(currentMetrics.totalCalls)}
            previousValue={previousMetrics ? fmtNumber(previousMetrics.totalCalls) : undefined}
            current={currentMetrics.totalCalls}
            previous={previousMetrics?.totalCalls}
            hasComparison={hasComparison}
          />
          <MetricCard
            label="Website Visits"
            value={fmtNumber(currentMetrics.totalWebsiteVisits)}
            previousValue={
              previousMetrics ? fmtNumber(previousMetrics.totalWebsiteVisits) : undefined
            }
            current={currentMetrics.totalWebsiteVisits}
            previous={previousMetrics?.totalWebsiteVisits}
            hasComparison={hasComparison}
          />
          <MetricCard
            label="Revenue"
            value={fmtCurrency(currentMetrics.totalRevenue)}
            previousValue={previousMetrics ? fmtCurrency(previousMetrics.totalRevenue) : undefined}
            current={currentMetrics.totalRevenue}
            previous={previousMetrics?.totalRevenue}
            hasComparison={hasComparison}
          />
          <MetricCard
            label="Conversion Rate"
            value={fmtPercent(currentMetrics.conversionRate)}
            previousValue={
              previousMetrics ? fmtPercent(previousMetrics.conversionRate) : undefined
            }
            current={currentMetrics.conversionRate}
            previous={previousMetrics?.conversionRate}
            hasComparison={hasComparison}
          />
        </section>
        <p className="text-xs text-slate-400">
          Conversion Rate = (Total Leads / Total Website Visits) × 100
        </p>

        {/* Charts */}
        {hasCurrent && (
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="mb-2 text-sm font-semibold text-slate-900">
                Leads, Calls &amp; Revenue Over Time
              </h2>
              <TimeSeriesChart rows={currentRows} />
            </div>

            {hasComparison && previousMetrics && (
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <h2 className="mb-2 text-sm font-semibold text-slate-900">
                  Current vs. Previous Period
                </h2>
                <ComparisonChart current={currentMetrics} previous={previousMetrics} />
              </div>
            )}
          </section>
        )}

        {/* Insights */}
        {hasCurrent && <InsightsCard insights={insights} />}
      </main>
    </div>
  );
}
