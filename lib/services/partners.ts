import "server-only";

import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";

import { recordAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { buildPagination } from "@/lib/utils";
import { partnerSchema } from "@/lib/validators/partner";

export async function generatePartnerCode() {
  const count = await prisma.partner.count();
  return `ADS${String(count + 1).padStart(3, "0")}`;
}

function partnerSort(sort = "createdAt-desc"): Prisma.PartnerOrderByWithRelationInput[] {
  switch (sort) {
    case "revenue-desc":
      return [{ revenuePaise: "desc" }];
    case "code-asc":
      return [{ code: "asc" }];
    case "name-asc":
      return [{ user: { name: "asc" } }];
    default:
      return [{ createdAt: "desc" }];
  }
}

export async function listPartners(params: Record<string, string | undefined>, scope: Prisma.PartnerWhereInput = {}) {
  const { page, pageSize, skip, take } = buildPagination(Number(params.page || 1), Number(params.pageSize || 10));
  const search = params.search?.trim();

  const where: Prisma.PartnerWhereInput = {
    AND: [
      scope,
      params.state ? { state: params.state } : {},
      params.district ? { district: params.district } : {},
      params.tehsil ? { tehsil: params.tehsil } : {},
      search
        ? {
            OR: [
              { code: { contains: search } },
              { user: { name: { contains: search } } },
              { user: { mobile: { contains: search } } },
              { user: { email: { contains: search } } },
            ],
          }
        : {},
    ],
  };

  const [items, total] = await Promise.all([
    prisma.partner.findMany({
      where,
      orderBy: partnerSort(params.sort),
      skip,
      take,
      include: {
        user: true,
        employees: true,
        applications: {
          include: {
            payment: true,
          },
        },
        wallet: true,
      },
    }),
    prisma.partner.count({ where }),
  ]);

  return {
    items: items.map((partner) => ({
      ...partner,
      totalLeads: partner.applications.length,
      totalFarmers: new Set(partner.applications.map((application) => application.farmerId)).size,
      revenuePaise: partner.applications.reduce((sum, application) => sum + (application.payment?.status === "SUCCESS" ? application.payment.amountPaise : 0), 0),
      withdrawCount: partner.wallet?.id ? 1 : 0,
    })),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
}

export async function getPartnerDetail(partnerId: string) {
  const partner = await prisma.partner.findUnique({
    where: { id: partnerId },
    include: {
      user: true,
      employees: {
        include: { user: true },
      },
      applications: {
        include: {
          farmer: true,
          payment: true,
        },
        orderBy: { createdAt: "desc" },
      },
      wallet: {
        include: {
          withdrawals: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
          ledgerEntries: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      },
      commissionSplits: true,
    },
  });

  if (!partner) {
    return null;
  }

  const performance = Array.from({ length: 6 }, (_, index) => {
    const application = partner.applications[index];
    return {
      label: application?.referenceNo ?? `Week ${index + 1}`,
      value: application?.payment?.amountPaise ?? 0,
    };
  }).reverse();

  return {
    ...partner,
    summary: {
      totalEmployees: partner.employees.length,
      totalFarmers: new Set(partner.applications.map((application) => application.farmerId)).size,
      totalRevenue: partner.applications.reduce((sum, application) => sum + (application.payment?.amountPaise ?? 0), 0),
      commissionEarned: partner.commissionSplits.reduce((sum, split) => sum + split.partnerAmountPaise, 0),
      approvedLeads: partner.applications.filter((application) => application.status === "APPROVED" || application.status === "DISBURSED").length,
    },
    performance,
  };
}

export async function createPartner(input: unknown, actorId?: string) {
  const parsed = partnerSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  const password = `Partner@${randomBytes(2).toString("hex")}`;
  const code = await generatePartnerCode();
  const passwordHash = await bcrypt.hash(password, 10);

  const partner = await prisma.partner.create({
    data: {
      code,
      state: parsed.data.state,
      district: parsed.data.district,
      tehsil: parsed.data.tehsil,
      status: parsed.data.status,
      user: {
        create: {
          name: parsed.data.name,
          mobile: parsed.data.mobile,
          email: parsed.data.email || undefined,
          role: "PARTNER",
          passwordHash,
        },
      },
      wallet: {
        create: {
          ownerType: "PARTNER",
        },
      },
    },
    include: {
      user: true,
    },
  });

  await recordAuditLog({
    actorId,
    entityType: "PARTNER",
    entityId: partner.id,
    action: "CREATE",
    description: `Created partner ${partner.code}`,
  });

  return { partner, password };
}

export async function updatePartner(partnerId: string, input: unknown, actorId?: string) {
  const parsed = partnerSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  const partner = await prisma.partner.update({
    where: { id: partnerId },
    data: {
      state: parsed.data.state,
      district: parsed.data.district,
      tehsil: parsed.data.tehsil,
      status: parsed.data.status,
      user: {
        update: {
          name: parsed.data.name,
          mobile: parsed.data.mobile,
          email: parsed.data.email || null,
        },
      },
    },
    include: { user: true },
  });

  await recordAuditLog({
    actorId,
    entityType: "PARTNER",
    entityId: partner.id,
    action: "UPDATE",
    description: `Updated partner ${partner.code}`,
  });

  return partner;
}

export async function deletePartner(partnerId: string, actorId?: string) {
  const partner = await prisma.partner.findUnique({
    where: { id: partnerId },
    include: { user: true },
  });

  if (!partner) {
    throw new Error("Partner not found");
  }

  await prisma.user.delete({
    where: { id: partner.userId },
  });

  await recordAuditLog({
    actorId,
    entityType: "PARTNER",
    entityId: partnerId,
    action: "DELETE",
    description: `Deleted partner ${partner.code}`,
  });

  return partner;
}

export async function resetPartnerPassword(partnerId: string, actorId?: string) {
  const partner = await prisma.partner.findUnique({
    where: { id: partnerId },
    include: { user: true },
  });

  if (!partner) {
    throw new Error("Partner not found");
  }

  const password = `Partner@${randomBytes(2).toString("hex")}`;
  await prisma.user.update({
    where: { id: partner.userId },
    data: {
      passwordHash: await bcrypt.hash(password, 10),
    },
  });

  await recordAuditLog({
    actorId,
    entityType: "PARTNER",
    entityId: partner.id,
    action: "RESET_PASSWORD",
    description: `Reset password for partner ${partner.code}`,
  });

  return { password, code: partner.code, mobile: partner.user.mobile };
}
