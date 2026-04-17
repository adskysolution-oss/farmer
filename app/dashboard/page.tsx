import { Activity, BadgeDollarSign, Clock3, CreditCard, Landmark, UserCheck2, Users } from "lucide-react";

import { OverviewCharts } from "@/components/charts/overview-charts";
import { StatCard } from "@/components/dashboard/stat-card";
import { LiveTrackingPanel } from "@/components/maps/live-tracking-panel";
import { SectionHeader } from "@/components/ui/section-header";
import { getCurrentUser } from "@/lib/auth/session";
import { getDashboardSummary } from "@/lib/services/dashboard";
import { formatCompactCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const summary = await getDashboardSummary(user);

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Control Center"
        description="API-driven command view for farmer growth, loan pipeline, partner performance, revenue realization, and live field visibility."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Today Farmers Count" value={String(summary.metrics.todayFarmersCount)} hint="Realtime intake today" icon={<Users className="h-5 w-5" />} />
        <StatCard label="Total Farmers" value={String(summary.metrics.totalFarmers)} hint="Across all acquisition channels" icon={<UserCheck2 className="h-5 w-5" />} />
        <StatCard label="Total Partners" value={String(summary.metrics.totalPartners)} hint="Active network operators" icon={<Landmark className="h-5 w-5" />} />
        <StatCard label="Total Employees" value={String(summary.metrics.totalEmployees)} hint="Field and calling staff" icon={<Activity className="h-5 w-5" />} />
        <StatCard label="Today Loan Applications" value={String(summary.metrics.todayLoanApplications)} hint="Captured today" icon={<CreditCard className="h-5 w-5" />} />
        <StatCard label="Total Loans Disbursed" value={String(summary.metrics.totalDisbursed)} hint="Cases closed successfully" icon={<BadgeDollarSign className="h-5 w-5" />} />
        <StatCard label="Total Rejected" value={String(summary.metrics.totalRejected)} hint="With tracked status reasoning" icon={<Clock3 className="h-5 w-5" />} />
        <StatCard label="Today Revenue" value={formatCompactCurrency(summary.metrics.todayRevenue)} hint="Collected via payment flow" icon={<CreditCard className="h-5 w-5" />} />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="glass-panel p-6">
          <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
          <p className="mt-3 font-display text-3xl font-semibold">{formatCompactCurrency(summary.metrics.totalRevenue)}</p>
        </div>
        <div className="glass-panel p-6">
          <p className="text-sm font-medium text-muted-foreground">Today New Registrations</p>
          <p className="mt-3 font-display text-3xl font-semibold">{summary.metrics.todayNewRegistrations}</p>
        </div>
        <div className="glass-panel p-6">
          <p className="text-sm font-medium text-muted-foreground">Pending Applications</p>
          <p className="mt-3 font-display text-3xl font-semibold">{summary.metrics.totalPending}</p>
        </div>
      </section>

      <OverviewCharts
        farmerGrowth={summary.charts.farmerGrowth}
        statusGraph={summary.charts.statusGraph}
        revenueSeries={summary.charts.revenueSeries}
        partnerPerformance={summary.charts.partnerPerformance}
      />

      <LiveTrackingPanel points={summary.tracking} />
    </div>
  );
}
