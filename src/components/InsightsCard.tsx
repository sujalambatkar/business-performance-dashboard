import { Insight } from "@/lib/insights";

interface InsightsCardProps {
  insights: Insight[];
}

const toneStyles: Record<Insight["tone"], string> = {
  positive: "border-green-200 bg-green-50 text-green-800",
  negative: "border-red-200 bg-red-50 text-red-800",
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
};

export default function InsightsCard({ insights }: InsightsCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">Performance Insights</h2>
      <p className="mt-0.5 text-xs text-slate-500">
        Automatically generated from your data using simple rule-based checks.
      </p>

      <ul className="mt-4 space-y-2">
        {insights.map((insight) => (
          <li
            key={insight.id}
            className={`rounded-md border px-3 py-2 text-sm ${toneStyles[insight.tone]}`}
          >
            {insight.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
