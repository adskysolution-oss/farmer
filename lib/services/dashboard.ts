import "server-only";

import { prisma } from "@/lib/prisma";
import { getApplicationScope, getEmployeeScope, getPartnerScope } from "@/lib/services/scope";

type DashboardUser = {
  role: "ADMIN" | "PARTNER" | "EMPLOYEE" | "CALLER";
  partner?: { id: string } | null;
  employee?: { id: string; partnerId: string | null } | null;
};

function startOfLocalDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfLocalDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function daysAgo(days: number) {
  const next = new Date();
  next.setDate(next.getDate() - days);
  return next;
}

export async function getDashboardSummary(user: DashboardUser) {
  const todayStart = startOfLocalDay(new Date());
  const todayEnd = endOfLocalDay(new Date());
  const applicationScope = getApplicationScope(user);
  const partnerScope = getPartnerScope(user);
  const employeeScope = getEmployeeScope(user);

  const [
    todayFarmersCount,
    totalFarmers,
    totalPartners,
    totalEmployees,
    todayLoanApplications,
    totalDisbursed,
    totalRejected,
    totalPending,
    successfulPayments,
    todayRevenueAggregate,
    totalRevenueAggregate,
    todayNewRegistrations,
    recentTracking,
  ] = await Promise.all([
    prisma.farmer.count({
      where: { createdAt: { gte: todayStart, lte: todayEnd } },
    }),
    prisma.farmer.count(),
    prisma.partner.count({ where: partnerScope }),
    prisma.employee.count({ where: employeeScope }),
    prisma.loanApplication.count({
      where: {
        ...applicationScope,
        createdAt: { gte: todayStart, lte: todayEnd },
      },
    }),
    prisma.loanApplication.count({
      where: {
        ...applicationScope,
        status: "DISBURSED",
      },
    }),
    prisma.loanApplication.count({
      where: {
        ...applicationScope,
        status: "REJECTED",
      },
    }),
    prisma.loanApplication.count({
      where: {
        ...applicationScope,
        status: {
          in: ["SUBMITTED", "UNDER_REVIEW", "DOCUMENT_PENDING"],
        },
      },
    }),
    prisma.payment.findMany({
      where: {
        status: "SUCCESS",
        application: applicationScope,
      },
      include: {
        application: {
          include: {
            partner: true,
            assignedEmployee: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    }),
    prisma.payment.aggregate({
      _sum: { amountPaise: true },
      where: {
        status: "SUCCESS",
        paidAt: { gte: todayStart, lte: todayEnd },
        application: applicationScope,
      },
    }),
    prisma.payment.aggregate({
      _sum: { amountPaise: true },
      where: {
        status: "SUCCESS",
        application: applicationScope,
      },
    }),
    prisma.user.count({
      where: {
        createdAt: { gte: todayStart, lte: todayEnd },
      },
    }),
    prisma.employeeTracking.findMany({
      orderBy: { lastActive: "desc" },
      take: 20,
      where: {
        employee: employeeScope,
      },
      include: {
        employee: {
          include: {
            user: true,
            partner: true,
          },
        },
      },
    }),
  ]);

  const dailyGrowthWindow = Array.from({ length: 7 }, (_, index) => {
    const date = daysAgo(6 - index);
    return {
      label: date.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      date,
    };
  });

  const [farmerGrowth, revenueSeries] = await Promise.all([
    Promise.all(
      dailyGrowthWindow.map(async (entry) => ({
        label: entry.label,
        value: await prisma.farmer.count({
          where: {
            createdAt: {
              gte: startOfLocalDay(entry.date),
              lte: endOfLocalDay(entry.date),
            },
          },
        }),
      })),
    ),
    Promise.all(
      dailyGrowthWindow.map(async (entry) => {
        const aggregate = await prisma.payment.aggregate({
          _sum: { amountPaise: true },
          where: {
            status: "SUCCESS",
            paidAt: {
              gte: startOfLocalDay(entry.date),
              lte: endOfLocalDay(entry.date),
            },
            application: applicationScope,
          },
        });

        return {
          label: entry.label,
          value: aggregate._sum.amountPaise ?? 0,
        };
      }),
    ),
  ]);

  const statusGraph = [
    { label: "Approved", value: successfulPayments.filter((payment) => payment.application?.status === "APPROVED" || payment.application?.status === "DISBURSED").length },
    { label: "Rejected", value: totalRejected },
    { label: "Pending", value: totalPending },
  ];

  const partnerPerformanceMap = new Map<string, { label: string; leads: number; revenue: number }>();
  for (const payment of successfulPayments) {
    const label = payment.application?.partner?.userId ? payment.application.partner.code : "Direct";
    const existing = partnerPerformanceMap.get(label) ?? { label, leads: 0, revenue: 0 };
    existing.leads += 1;
    existing.revenue += payment.amountPaise;
    partnerPerformanceMap.set(label, existing);
  }

  return {
    metrics: {
      todayFarmersCount,
      totalFarmers,
      totalPartners,
      totalEmployees,
      todayLoanApplications,
      totalDisbursed,
      totalRejected,
      totalPending,
      todayRevenue: todayRevenueAggregate._sum.amountPaise ?? 0,
      totalRevenue: totalRevenueAggregate._sum.amountPaise ?? 0,
      todayNewRegistrations,
    },
    charts: {
      farmerGrowth,
      statusGraph,
      revenueSeries,
      partnerPerformance: Array.from(partnerPerformanceMap.values()),
    },
    tracking: recentTracking.map((item) => ({
      id: item.id,
      employeeId: item.employeeId,
      name: item.employee.user.name,
      partner: item.employee.partner?.code ?? "Direct",
      latitude: item.latitude,
      longitude: item.longitude,
      isOnline: item.isOnline,
      lastActive: item.lastActive,
      designation: item.employee.designation,
    })),
  };
}
