import { prisma } from "@/lib/prisma";

export async function recordAuditLog(input: {
  actorId?: string | null;
  entityType: string;
  entityId: string;
  action: string;
  description: string;
  meta?: Record<string, unknown>;
}) {
  return prisma.auditLog.create({
    data: {
      actorId: input.actorId ?? undefined,
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      description: input.description,
      metaJson: input.meta ? JSON.stringify(input.meta) : undefined,
    },
  });
}
