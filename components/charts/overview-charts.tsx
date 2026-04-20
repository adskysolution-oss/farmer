"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCompactCurrency } from "@/lib/utils";

type SeriesPoint = { label: string; value: number };

export function OverviewCharts({
  farmerGrowth,
  statusGraph,
  revenueSeries,
  partnerPerformance,
}: {
  farmerGrowth: SeriesPoint[];
  statusGraph: SeriesPoint[];
  revenueSeries: SeriesPoint[];
  partnerPerformance: Array<{ label: string; leads: number; revenue: number }>;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Daily Farmers Growth</CardTitle>
          <CardDescription>New registrations captured across the last seven operating days.</CardDescription>
        </CardHeader>
        <CardContent className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={farmerGrowth}>
              <defs>
                <linearGradient id="farmerGrowth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
              <XAxis dataKey="label" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} fill="url(#farmerGrowth)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Loan Status Mix</CardTitle>
          <CardDescription>Approved, rejected, and in-flight applications within the current access scope.</CardDescription>
        </CardHeader>
        <CardContent className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusGraph}
                dataKey="value"
                nameKey="label"
                innerRadius={72}
                outerRadius={110}
                paddingAngle={4}
                fill="#2563eb"
              />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {statusGraph.map((item) => (
              <div key={item.label} className="rounded-2xl bg-secondary/60 px-4 py-3 text-sm">
                <p className="text-muted-foreground">{item.label}</p>
                <p className="mt-1 font-display text-xl font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>Daily payment realization from the configured application payment flow.</CardDescription>
        </CardHeader>
        <CardContent className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
              <XAxis dataKey="label" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" tickFormatter={(value) => `${Math.round(value / 100)}`} />
              <Tooltip formatter={(value: number) => formatCompactCurrency(value)} />
              <Bar dataKey="value" fill="#0f766e" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Partner Performance</CardTitle>
          <CardDescription>Converted payments attributed to each partner channel.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {partnerPerformance.length ? (
            partnerPerformance.map((item) => (
              <div key={item.label} className="rounded-2xl border border-border/70 bg-card/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.leads} converted leads</p>
                  </div>
                  <p className="font-display text-xl font-semibold" suppressHydrationWarning>
                    {formatCompactCurrency(item.revenue)}
                  </p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${Math.min(100, item.leads * 12)}%` }} />
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">No partner-attributed revenue has been captured yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
