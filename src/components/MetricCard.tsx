import { percentChange } from "@/lib/metrics";

interface MetricCardProps {
  label: string;
  value: string;
  previousValue?: string;
  current?: number;
  previous?: number;
  hasComparison: boolean;
}

export default function MetricCard({
  label,
  value,
  previousValue,
  current,
  previous,
  hasComparison,
}: MetricCardProps) {
  const change =
    hasComparison && current !== undefined && previous !== undefined
      ? percentChange(current, previous)
      : null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>

      {hasComparison && (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400">Previous: {previousValue}</span>
          {change !== null ? (
            <span
              className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-medium ${
                change > 0
                  ? "bg-green-50 text-green-700"
                  : change < 0
                  ? "bg-red-50 text-red-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {change > 0 ? "▲" : change < 0 ? "▼" : "–"} {Math.abs(change).toFixed(1)}%
            </span>
          ) : (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-500">
              N/A
            </span>
          )}
        </div>
      )}
    </div>
  );
}
