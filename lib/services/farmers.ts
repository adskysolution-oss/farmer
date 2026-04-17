import "server-only";

import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Prisma } from "@prisma/client";

import { recordAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { buildPagination } from "@/lib/utils";
import { farmerSchema } from "@/lib/validators/farmer";

function farmerSort(sort = "createdAt-desc"): Prisma.LoanApplicationOrderByWithRelationInput[] {
  switch (sort) {
    case "name-asc":
      return [{ farmer: { name: "asc" } }];
    case "status-asc":
      return [{ status: "asc" }];
    case "payment-desc":
      return [{ paymentAmountPaise: "desc" }];
    default:
      return [{ createdAt: "desc" }];
  }
}

export async function listFarmerApplications(params: Record<string, string | undefined>, scope: Prisma.LoanApplicationWhereInput = {}) {
  const { page, pageSize, skip, take } = buildPagination(Number(params.page || 1), Number(params.pageSize || 10));
  const search = params.search?.trim();

  const where: Prisma.LoanApplicationWhereInput = {
    AND: [
      scope,
      params.status ? { status: params.status as never } : {},
      params.paymentStatus ? { paymentStatus: params.paymentStatus as never } : {},
      params.loanType ? { loanType: params.loanType } : {},
      search
        ? {
            OR: [
              { referenceNo: { contains: search } },
              { farmer: { name: { contains: search } } },
              { farmer: { mobile: { contains: search } } },
              { farmer: { district: { contains: search } } },
            ],
          }
        : {},
    ],
  };

  const [items, total] = await Promise.all([
    prisma.loanApplication.findMany({
      where,
      orderBy: farmerSort(params.sort),
      skip,
      take,
      include: {
        farmer: true,
        partner: {
          include: { user: true },
        },
        assignedEmployee: {
          include: { user: true },
        },
        assignedCaller: {
          include: { user: true },
        },
        payment: true,
        documents: true,
      },
    }),
    prisma.loanApplication.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
}

export async function getFarmerDetail(farmerId: string) {
  return prisma.farmer.findUnique({
    where: { id: farmerId },
    include: {
      applications: {
        include: {
          partner: {
            include: { user: true },
          },
          assignedEmployee: {
            include: { user: true },
          },
          assignedCaller: {
            include: { user: true },
          },
          payment: true,
          documents: true,
          timeline: {
            orderBy: { createdAt: "desc" },
          },
          callLogs: {
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function createFarmerApplication(input: unknown, actorId?: string) {
  const parsed = farmerSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  const farmer = await prisma.farmer.create({
    data: {
      name: parsed.data.name,
      mobile: parsed.data.mobile,
      state: parsed.data.state,
      district: parsed.data.district,
      tehsil: parsed.data.tehsil || undefined,
      village: parsed.data.village,
      source: "MANUAL_ENTRY",
    },
  });

  const application = await prisma.loanApplication.create({
    data: {
      referenceNo: `APP-${randomBytes(2).toString("hex").toUpperCase()}`,
      farmerId: farmer.id,
      partnerId: parsed.data.partnerId || undefined,
      employeeId: parsed.data.employeeId || undefined,
      callerId: parsed.data.callerId || undefined,
      loanType: parsed.data.loanType,
      requestedAmountPaise: parsed.data.requestedAmountPaise,
      status: parsed.data.status,
      paymentStatus: parsed.data.paymentStatus,
      paymentAmountPaise: parsed.data.paymentAmountPaise,
    },
  });

  await prisma.applicationTimeline.create({
    data: {
      applicationId: application.id,
      actorId,
      title: "Application created",
      description: "Farmer application created from the operations panel.",
      status: parsed.data.status,
    },
  });

  await recordAuditLog({
    actorId,
    entityType: "LOAN_APPLICATION",
    entityId: application.id,
    action: "CREATE",
    description: `Created application ${application.referenceNo}`,
  });

  return { farmer, application };
}

export async function updateApplication(applicationId: string, input: Partial<Prisma.LoanApplicationUpdateInput>, actorId?: string) {
  const application = await prisma.loanApplication.update({
    where: { id: applicationId },
    data: input,
  });

  await prisma.applicationTimeline.create({
    data: {
      applicationId,
      actorId,
      title: "Application updated",
      description: "Loan application details were updated.",
      status: typeof input.status === "string" ? input.status : "UPDATED",
    },
  });

  return application;
}

export async function deleteFarmer(farmerId: string, actorId?: string) {
  const farmer = await prisma.farmer.delete({
    where: { id: farmerId },
  });

  await recordAuditLog({
    actorId,
    entityType: "FARMER",
    entityId: farmer.id,
    action: "DELETE",
    description: `Deleted farmer ${farmer.name}`,
  });

  return farmer;
}

export async function uploadApplicationDocument(input: {
  applicationId: string;
  type: "AADHAAR" | "PAN" | "LAND_PAPER" | "BANK_DETAILS" | "OTHER";
  fileName: string;
  mimeType: string;
  buffer: Buffer;
  uploadedById?: string;
}) {
  const directory = join(process.cwd(), "storage", "documents");
  await mkdir(directory, { recursive: true });
  const safeName = `${input.applicationId}-${Date.now()}-${input.fileName.replace(/\s+/g, "-")}`;
  const filePath = join(directory, safeName);
  await writeFile(filePath, input.buffer);

  return prisma.farmerDocument.create({
    data: {
      applicationId: input.applicationId,
      type: input.type,
      fileName: input.fileName,
      filePath,
      mimeType: input.mimeType,
      sizeBytes: input.buffer.byteLength,
      uploadedById: input.uploadedById,
    },
  });
}
