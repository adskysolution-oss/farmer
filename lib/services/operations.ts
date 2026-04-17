import "server-only";

import { randomBytes } from "node:crypto";
import { WithdrawalStatus } from "@prisma/client";
import * as XLSX from "xlsx";

import { recordAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { getApplicationScope, getWalletScope } from "@/lib/services/scope";
import { safeJsonParse } from "@/lib/utils";

type ScopedUser = {
  id: string;
  role: "ADMIN" | "PARTNER" | "EMPLOYEE" | "CALLER";
  partner?: { id: string } | null;
  employee?: { id: string; partnerId: string | null } | null;
};

export async function listPayments(user: ScopedUser) {
  return prisma.payment.findMany({
    where: {
      application: getApplicationScope(user),
    },
    orderBy: { createdAt: "desc" },
    include: {
      application: {
        include: {
          farmer: true,
          partner: true,
        },
      },
    },
  });
}

export async function listWallets(user: ScopedUser) {
  return prisma.wallet.findMany({
    where: getWalletScope(user),
    include: {
      partner: {
        include: { user: true },
      },
      employee: {
        include: { user: true },
      },
      withdrawals: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      ledgerEntries: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function listWithdrawals(user: ScopedUser) {
  return prisma.withdrawalRequest.findMany({
    where: user.role === "ADMIN" ? {} : { wallet: getWalletScope(user) },
    include: {
      wallet: {
        include: {
          partner: {
            include: { user: true },
          },
          employee: {
            include: { user: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateWithdrawalStatus(withdrawalId: string, status: WithdrawalStatus, actorId: string, notes?: string) {
  const withdrawal = await prisma.withdrawalRequest.update({
    where: { id: withdrawalId },
    data: {
      status,
      notes,
      processedById: actorId,
      processedAt: new Date(),
    },
  });

  await recordAuditLog({
    actorId,
    entityType: "WITHDRAWAL",
    entityId: withdrawal.id,
    action: status,
    description: `Marked withdrawal ${withdrawal.id} as ${status}`,
  });

  return withdrawal;
}

export async function getSettingsBundle() {
  const [settings, gateways, form] = await Promise.all([
    prisma.setting.findMany({ orderBy: { key: "asc" } }),
    prisma.paymentGatewayConfig.findMany({ orderBy: { gateway: "asc" } }),
    prisma.dynamicForm.findFirst({
      include: {
        fields: { orderBy: { sortOrder: "asc" } },
      },
    }),
  ]);

  return {
    settings: settings.reduce<Record<string, string>>((accumulator, item) => {
      accumulator[item.key] = item.value;
      return accumulator;
    }, {}),
    gateways,
    form,
  };
}

export async function updateSettingsBundle(input: {
  settings?: Record<string, string>;
  gateways?: Array<{
    id: string;
    enabled: boolean;
    keyId?: string;
    secretKey?: string;
    merchantId?: string;
    saltKey?: string;
    saltIndex?: string;
    endpointUrl?: string;
    successUrl?: string;
    failureUrl?: string;
    webhookSecret?: string;
  }>;
}, actorId: string) {
  if (input.settings) {
    await Promise.all(
      Object.entries(input.settings).map(([key, value]) =>
        prisma.setting.upsert({
          where: { key },
          create: {
            key,
            value,
            updatedById: actorId,
          },
          update: {
            value,
            updatedById: actorId,
          },
        }),
      ),
    );
  }

  if (input.gateways?.length) {
    await Promise.all(
      input.gateways.map((gateway) =>
        prisma.paymentGatewayConfig.update({
          where: { id: gateway.id },
          data: gateway,
        }),
      ),
    );
  }

  await recordAuditLog({
    actorId,
    entityType: "SETTINGS",
    entityId: "GLOBAL",
    action: "UPDATE",
    description: "Updated global platform settings",
  });
}

export async function getCampaigns() {
  return prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      sentBy: true,
      dispatches: true,
    },
  });
}

export async function createCampaign(input: {
  name: string;
  channel: "WHATSAPP" | "SMS" | "EMAIL";
  recipientGroup: "FARMERS" | "PARTNERS" | "EMPLOYEES";
  message: string;
}, actorId: string) {
  const campaign = await prisma.campaign.create({
    data: {
      name: input.name,
      channel: input.channel,
      recipientGroup: input.recipientGroup,
      message: input.message,
      status: "SENT",
      sentById: actorId,
      sentAt: new Date(),
    },
  });

  let recipients: Array<{ id: string; label: string }> = [];
  if (input.recipientGroup === "FARMERS") {
    recipients = (await prisma.farmer.findMany()).map((farmer) => ({ id: farmer.id, label: farmer.name }));
  }
  if (input.recipientGroup === "PARTNERS") {
    recipients = (await prisma.partner.findMany({ include: { user: true } })).map((partner) => ({ id: partner.id, label: partner.user.name }));
  }
  if (input.recipientGroup === "EMPLOYEES") {
    recipients = (await prisma.employee.findMany({ include: { user: true } })).map((employee) => ({ id: employee.id, label: employee.user.name }));
  }

  if (recipients.length) {
    await prisma.campaignDispatch.createMany({
      data: recipients.map((recipient) => ({
        campaignId: campaign.id,
        recipientType: input.recipientGroup.slice(0, -1),
        recipientId: recipient.id,
        recipientLabel: recipient.label,
        status: "SENT",
        providerResponse: JSON.stringify({ channel: input.channel, accepted: true }),
      })),
    });
  }

  return prisma.campaign.findUnique({
    where: { id: campaign.id },
    include: { dispatches: true, sentBy: true },
  });
}

export async function getCallingOverview(user: ScopedUser) {
  const scope = getApplicationScope(user);

  const [leads, callers] = await Promise.all([
    prisma.loanApplication.findMany({
      where: scope,
      include: {
        farmer: true,
        assignedCaller: {
          include: { user: true },
        },
        callLogs: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.employee.findMany({
      where: {
        ...(user.role === "PARTNER" && user.partner?.id ? { partnerId: user.partner.id } : {}),
        isCaller: true,
      },
      include: { user: true },
    }),
  ]);

  return {
    leads,
    callers,
  };
}

export async function autoDistributeLeads(actor: ScopedUser) {
  const callers = await prisma.employee.findMany({
    where: {
      isCaller: true,
      ...(actor.role === "PARTNER" && actor.partner?.id ? { partnerId: actor.partner.id } : {}),
    },
    orderBy: { createdAt: "asc" },
  });

  const unassignedLeads = await prisma.loanApplication.findMany({
    where: {
      ...getApplicationScope(actor),
      callerId: null,
    },
    orderBy: { createdAt: "asc" },
  });

  if (!callers.length || !unassignedLeads.length) {
    return { assigned: 0 };
  }

  await Promise.all(
    unassignedLeads.map((lead, index) =>
      prisma.loanApplication.update({
        where: { id: lead.id },
        data: {
          callerId: callers[index % callers.length].id,
          assignedToCallerAt: new Date(),
        },
      }),
    ),
  );

  return { assigned: unassignedLeads.length };
}

export async function bulkImportLeads(buffer: Buffer, actorId: string) {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(firstSheet);

  let created = 0;

  for (const row of rows) {
    const farmer = await prisma.farmer.create({
      data: {
        name: row.name || row.Name || "Unnamed Farmer",
        mobile: String(row.mobile || row.Mobile || ""),
        state: row.state || row.State || "Unknown",
        district: row.district || row.District || "Unknown",
        tehsil: row.tehsil || row.Tehsil || undefined,
        village: row.village || row.Village || "Unknown",
        source: "BULK_IMPORT",
      },
    });

    await prisma.loanApplication.create({
      data: {
        referenceNo: `APP-${randomBytes(2).toString("hex").toUpperCase()}`,
        farmerId: farmer.id,
        loanType: row.loanType || row["Loan Type"] || "KCC",
        status: "SUBMITTED",
        paymentStatus: "PENDING",
      },
    });

    created += 1;
  }

  await recordAuditLog({
    actorId,
    entityType: "LEAD_IMPORT",
    entityId: String(Date.now()),
    action: "IMPORT",
    description: `Imported ${created} leads via spreadsheet upload`,
  });

  return { created };
}

export async function recordCallFeedback(input: {
  applicationId: string;
  callerId: string;
  connectionStatus: "CONNECTED" | "NOT_CONNECTED";
  interestStatus: "INTERESTED" | "NOT_INTERESTED" | "DOCUMENTS_PENDING" | "FOLLOW_UP";
  notes?: string;
  followUpDate?: string;
}) {
  await prisma.callLog.create({
    data: {
      applicationId: input.applicationId,
      callerId: input.callerId,
      connectionStatus: input.connectionStatus,
      interestStatus: input.interestStatus,
      notes: input.notes,
      followUpDate: input.followUpDate ? new Date(input.followUpDate) : undefined,
    },
  });

  return prisma.loanApplication.update({
    where: { id: input.applicationId },
    data: {
      callConnectionStatus: input.connectionStatus,
      leadInterestStatus: input.interestStatus,
      callerNotes: input.notes,
      followUpDate: input.followUpDate ? new Date(input.followUpDate) : null,
    },
  });
}

export async function updateFormDefinition(input: {
  formId: string;
  title: string;
  description?: string;
  paymentEnabled: boolean;
  paymentMandatory: boolean;
  paymentAmountPaise: number;
  fields: Array<{
    id?: string;
    label: string;
    key: string;
    type: "TEXT" | "NUMBER" | "SELECT" | "DATE" | "TEXTAREA" | "FILE" | "RADIO" | "CHECKBOX";
    required: boolean;
    placeholder?: string;
    optionsJson?: string;
    sortOrder: number;
  }>;
}, actorId: string) {
  const form = await prisma.dynamicForm.update({
    where: { id: input.formId },
    data: {
      title: input.title,
      description: input.description,
      paymentEnabled: input.paymentEnabled,
      paymentMandatory: input.paymentMandatory,
      paymentAmountPaise: input.paymentAmountPaise,
    },
  });

  const existingIds = input.fields.filter((field) => field.id).map((field) => field.id as string);
  await prisma.dynamicFormField.deleteMany({
    where: {
      formId: input.formId,
      id: { notIn: existingIds.length ? existingIds : ["__none__"] },
    },
  });

  await Promise.all(
    input.fields.map((field) =>
      field.id
        ? prisma.dynamicFormField.update({
            where: { id: field.id },
            data: field,
          })
        : prisma.dynamicFormField.create({
            data: {
              formId: input.formId,
              label: field.label,
              key: field.key,
              type: field.type,
              required: field.required,
              placeholder: field.placeholder,
              optionsJson: field.optionsJson,
              sortOrder: field.sortOrder,
            },
          }),
    ),
  );

  await recordAuditLog({
    actorId,
    entityType: "FORM",
    entityId: form.id,
    action: "UPDATE",
    description: "Updated public farmer intake form and payment controls",
  });

  return prisma.dynamicForm.findUnique({
    where: { id: input.formId },
    include: { fields: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function getTrackingSnapshot(user: ScopedUser) {
  const tracking = await prisma.employeeTracking.findMany({
    where: {
      employee: user.role === "ADMIN" ? {} : user.role === "PARTNER" && user.partner?.id ? { partnerId: user.partner.id } : user.employee?.id ? { id: user.employee.id } : { id: "__none__" },
    },
    include: {
      employee: {
        include: {
          user: true,
          partner: true,
        },
      },
    },
    orderBy: { lastActive: "desc" },
    take: 50,
  });

  return tracking.map((item) => ({
    id: item.id,
    employeeId: item.employeeId,
    name: item.employee.user.name,
    partner: item.employee.partner?.code || "Direct",
    latitude: item.latitude,
    longitude: item.longitude,
    isOnline: item.isOnline,
    lastActive: item.lastActive,
    designation: item.employee.designation,
  }));
}

export async function updateTrackingHeartbeat(input: {
  employeeId: string;
  latitude: number;
  longitude: number;
}) {
  return prisma.employeeTracking.create({
    data: {
      employeeId: input.employeeId,
      latitude: input.latitude,
      longitude: input.longitude,
      lastActive: new Date(),
      isOnline: true,
    },
  });
}

export async function createPublicApplication(input: Record<string, FormDataEntryValue>, gatewayOverride?: string) {
  const form = await prisma.dynamicForm.findFirst({
    include: { fields: { orderBy: { sortOrder: "asc" } } },
  });

  if (!form) {
    throw new Error("No public form is configured");
  }

  const farmer = await prisma.farmer.create({
    data: {
      name: String(input.name || ""),
      mobile: String(input.mobile || ""),
      state: String(input.state || ""),
      district: String(input.district || ""),
      village: String(input.village || ""),
      notes: String(input.notes || ""),
      source: "SELF_SERVICE",
    },
  });

  const application = await prisma.loanApplication.create({
    data: {
      referenceNo: `APP-${randomBytes(2).toString("hex").toUpperCase()}`,
      farmerId: farmer.id,
      loanType: String(input.loanType || "KCC"),
      requestedAmountPaise: Number(input.requestedAmount || 0) * 100,
      status: "SUBMITTED",
      paymentStatus: form.paymentEnabled ? "PENDING" : "WAIVED",
      paymentRequired: form.paymentEnabled,
      paymentAmountPaise: form.paymentAmountPaise,
    },
  });

  if (!form.paymentEnabled || !form.paymentMandatory) {
    return { application, payment: null };
  }

  const gateway = await prisma.paymentGatewayConfig.findFirst({
    where: {
      enabled: true,
      ...(gatewayOverride ? { gateway: gatewayOverride as never } : {}),
    },
  });

  const payment = await prisma.payment.create({
    data: {
      applicationId: application.id,
      gateway: gateway?.gateway ?? "KESARI",
      amountPaise: form.paymentAmountPaise,
      payerName: farmer.name,
      payerMobile: farmer.mobile,
      status: gateway ? "PENDING" : "FAILED",
      metaJson: JSON.stringify({ gatewayConfigured: Boolean(gateway) }),
    },
  });

  return { application, payment, gatewayConfigured: Boolean(gateway), gateway };
}

export async function verifyPayment(input: {
  paymentId: string;
  transactionId: string;
  success: boolean;
}) {
  const payment = await prisma.payment.update({
    where: { id: input.paymentId },
    data: {
      status: input.success ? "SUCCESS" : "FAILED",
      transactionId: input.transactionId,
      paidAt: input.success ? new Date() : undefined,
    },
    include: {
      application: true,
    },
  });

  if (input.success && payment.applicationId && payment.application) {
    await prisma.loanApplication.update({
      where: { id: payment.applicationId },
      data: {
        paymentStatus: "SUCCESS",
      },
    });

    const commission = await prisma.commissionSetting.findFirst();
    const partnerAmountPaise =
      payment.application.partnerId && commission ? Math.round(payment.amountPaise * (commission.partnerSharePercent / 100)) : 0;
    const employeeAmountPaise =
      payment.application.employeeId && commission ? Math.round(payment.amountPaise * (commission.employeeSharePercent / 100)) : 0;
    const adminAmountPaise = payment.amountPaise - partnerAmountPaise - employeeAmountPaise;

    await prisma.commissionSplit.create({
      data: {
        paymentId: payment.id,
        applicationId: payment.applicationId,
        partnerId: payment.application.partnerId || undefined,
        employeeId: payment.application.employeeId || undefined,
        adminAmountPaise,
        partnerAmountPaise,
        employeeAmountPaise,
        snapshotJson: JSON.stringify({
          adminSharePercent: commission?.adminSharePercent ?? 40,
          partnerSharePercent: commission?.partnerSharePercent ?? 35,
          employeeSharePercent: commission?.employeeSharePercent ?? 25,
        }),
      },
    });
  }

  return payment;
}

export function parseFormFieldOptions(value?: string | null) {
  return safeJsonParse<string[]>(value, []);
}
