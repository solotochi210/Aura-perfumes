"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatNaira } from "@/lib/money";
import type { TrendPoint } from "@/lib/analytics";

export function RevenueChart({ data }: { data: TrendPoint[] }) {
  const empty = data.every((point) => point.revenue === 0 && point.profit === 0);
  if (empty) {
    return (
      <div className="flex h-72 items-center justify-center border border-line bg-paper text-sm text-muted">
        Revenue will appear here after the first paid order.
      </div>
    );
  }

  return (
    <div className="h-80 border border-line bg-paper p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#e4d9cb" vertical={false} />
          <XAxis dataKey="label" stroke="#8a8178" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#8a8178"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => formatNaira(value).replace("NGN", "₦").replace(".00", "")}
            width={72}
          />
          <Tooltip
            formatter={(value) => formatNaira(Number(value ?? 0))}
            contentStyle={{ background: "#fbf8f4", border: "1px solid #e4d9cb", borderRadius: 0 }}
          />
          <Legend />
          <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#1c1612" strokeWidth={1.5} dot={false} />
          <Line type="monotone" dataKey="profit" name="Profit" stroke="#a68456" strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
