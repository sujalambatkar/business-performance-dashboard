"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { DailyRow } from "@/lib/csvParser";

interface TimeSeriesChartProps {
  rows: DailyRow[];
}

export default function TimeSeriesChart({ rows }: TimeSeriesChartProps) {
  const data = [...rows].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="leads" name="Leads" stroke="#4f46e5" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="calls" name="Calls" stroke="#0ea5e9" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#16a34a" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
