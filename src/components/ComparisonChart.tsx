"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { PeriodMetrics } from "@/lib/metrics";

interface ComparisonChartProps {
  current: PeriodMetrics;
  previous: PeriodMetrics;
}

export default function ComparisonChart({ current, previous }: ComparisonChartProps) {
  const data = [
    { name: "Leads", Current: current.totalLeads, Previous: previous.totalLeads },
    { name: "Calls", Current: current.totalCalls, Previous: previous.totalCalls },
    { name: "Visits", Current: current.totalWebsiteVisits, Previous: previous.totalWebsiteVisits },
    { name: "Revenue", Current: current.totalRevenue, Previous: previous.totalRevenue },
  ];

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="Previous" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Current" fill="#4f46e5" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
