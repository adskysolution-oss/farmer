import "server-only";

import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";

import { recordAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { buildPagination } from "@/lib/utils";
import { employeeSchema } from "@/lib/validators/employee";

function employeeSort(sort = "createdAt-desc"): Prisma.EmployeeOrderByWithRelationInput[] {
  switch (sort) {
    case "name-asc":
      return [{ user: { name: "asc" } }];
    case "leads-desc":
      return [{ leadsGenerated: "desc" }];
    case "score-desc":
      return [{ performanceScore: "desc" }];
    default:
      return [{ createdAt: "desc" }];
  }
}

export async function listEmployees(params: Record<string, string | undefined>, scope: Prisma.EmployeeWhereInput = {}) {
  const { page, pageSize, skip, take } = buildPagination(Number(params.page || 1), Number(params.pageSize || 10));
  const search = params.search?.trim();

  const where: Prisma.EmployeeWhereInput = {
    AND: [
      scope,
      params.partnerId ? { partnerId: params.partnerId } : {},
      search
        ? {
            OR: [
              { user: { name: { contains: search } } },
              { user: { mobile: { contains: search } } },
              { state: { contains: search } },
              { district: { contains: search } },
            ],
          }
        : {},
    ],
  };

  const [items, total] = await Promise.all([
    prisma.employee.findMany({
      where,
      orderBy: employeeSort(params.sort),
      skip,
      take,
      include: {
        user: true,
        partner: {
          include: { user: true },
        },
        assignedApplications: true,
        callerApplications: true,
        wallet: true,
      },
    }),
    prisma.employee.count({ where }),
  ]);

  return {
    items: items.map((employee) => {
      const totalLeads = employee.assignedApplications.length + employee.callerApplications.length;
      const approvedLeads = employee.assignedApplications.filter(
        (application) => application.status === "APPROVED" || application.status === "DISBURSED",
      ).length;

      return {
        ...employee,
        totalLeads,
        conversionRate: totalLeads ? Math.round((approvedLeads / totalLeads) * 100) : 0,
      };
    }),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
}

export async function getEmployeeDetail(employeeId: string) {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: {
      user: true,
      partner: {
        include: { user: true },
      },
      assignedApplications: {
        include: {
          farmer: true,
          payment: true,
        },
      },
      callerApplications: {
        include: {
          farmer: true,
        },
      },
      wallet: {
        include: {
          ledgerEntries: { orderBy: { createdAt: "desc" }, take: 10 },
        },
      },
      tracking: {
        orderBy: { lastActive: "desc" },
        take: 10,
      },
    },
  });

  if (!employee) {
    return null;
  }

  const totalLeads = employee.assignedApplications.length + employee.callerApplications.length;
  const approvedLeads = employee.assignedApplications.filter(
    (application) => application.status === "APPROVED" || application.status === "DISBURSED",
  ).length;
  const pendingLeads = employee.assignedApplications.filter(
    (application) => application.status === "SUBMITTED" || application.status === "UNDER_REVIEW" || application.status === "DOCUMENT_PENDING",
  ).length;

  return {
    ...employee,
    summary: {
      totalLeads,
      approvedLeads,
      pendingLeads,
      earnings: employee.wallet?.lifetimeEarningsPaise ?? 0,
      performanceScore: employee.performanceScore,
    },
  };
}

export async function createEmployee(input: unknown, actorId?: string) {
  const parsed = employeeSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  const password = `${parsed.data.isCaller ? "Caller" : "Employee"}@${randomBytes(2).toString("hex")}`;
  const employee = await prisma.employee.create({
    data: {
      designation: parsed.data.designation,
      state: parsed.data.state,
      district: parsed.data.district,
      tehsil: parsed.data.tehsil || undefined,
      status: parsed.data.status,
      isCaller: parsed.data.isCaller,
      fixedSalaryPaise: parsed.data.fixedSalaryPaise,
      commissionRate: parsed.data.commissionRate,
      partner: parsed.data.partnerId ? { connect: { id: parsed.data.partnerId } } : undefined,
      user: {
        create: {
          name: parsed.data.name,
          mobile: parsed.data.mobile,
          email: parsed.data.email || undefined,
          role: parsed.data.isCaller ? "CALLER" : "EMPLOYEE",
          passwordHash: await bcrypt.hash(password, 10),
        },
      },
      wallet: {
        create: {
          ownerType: "EMPLOYEE",
        },
      },
    },
    include: {
      user: true,
      partner: true,
    },
  });

  await recordAuditLog({
    actorId,
    entityType: "EMPLOYEE",
    entityId: employee.id,
    action: "CREATE",
    description: `Created employee ${employee.user.name}`,
  });

  return { employee, password };
}

export async function updateEmployee(employeeId: string, input: unknown, actorId?: string) {
  const parsed = employeeSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  const employee = await prisma.employee.update({
    where: { id: employeeId },
    data: {
      designation: parsed.data.designation,
      state: parsed.data.state,
      district: parsed.data.district,
      tehsil: parsed.data.tehsil || null,
      status: parsed.data.status,
      isCaller: parsed.data.isCaller,
      fixedSalaryPaise: parsed.data.fixedSalaryPaise,
      commissionRate: parsed.data.commissionRate,
      partner: parsed.data.partnerId ? { connect: { id: parsed.data.partnerId } } : { disconnect: true },
      user: {
        update: {
          name: parsed.data.name,
          mobile: parsed.data.mobile,
          email: parsed.data.email || null,
          role: parsed.data.isCaller ? "CALLER" : "EMPLOYEE",
        },
      },
    },
    include: {
      user: true,
      partner: true,
    },
  });

  await recordAuditLog({
    actorId,
    entityType: "EMPLOYEE",
    entityId: employee.id,
    action: "UPDATE",
    description: `Updated employee ${employee.user.name}`,
  });

  return employee;
}

export async function deleteEmployee(employeeId: string, actorId?: string) {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: { user: true },
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  await prisma.user.delete({
    where: { id: employee.userId },
  });

  await recordAuditLog({
    actorId,
    entityType: "EMPLOYEE",
    entityId: employee.id,
    action: "DELETE",
    description: `Deleted employee ${employee.user.name}`,
  });

  return employee;
}

export async function resetEmployeePassword(employeeId: string, actorId?: string) {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: { user: true },
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  const password = `${employee.isCaller ? "Caller" : "Employee"}@${randomBytes(2).toString("hex")}`;
  await prisma.user.update({
    where: { id: employee.userId },
    data: {
      passwordHash: await bcrypt.hash(password, 10),
    },
  });

  await recordAuditLog({
    actorId,
    entityType: "EMPLOYEE",
    entityId: employee.id,
    action: "RESET_PASSWORD",
    description: `Reset password for employee ${employee.user.name}`,
  });

  return { password, name: employee.user.name, mobile: employee.user.mobile };
}
