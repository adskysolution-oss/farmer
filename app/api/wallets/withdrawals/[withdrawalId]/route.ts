import { WithdrawalStatus } from "@prisma/client";

import { getCurrentUser } from "@/lib/auth/session";
import { fail, ok } from "@/lib/http";
import { updateWithdrawalStatus } from "@/lib/services/operations";

export async function PATCH(request: Request, { params }: { params: Promise<{ withdrawalId: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return fail("Unauthorized", 401);
  }

  const body = await request.json();
  const status = body.status as WithdrawalStatus;
  if (!status || !["APPROVED", "REJECTED", "PAID", "PENDING"].includes(status)) {
    return fail("Invalid withdrawal status", 422);
  }

  const { withdrawalId } = await params;
  const result = await updateWithdrawalStatus(withdrawalId, status, user.id, body.notes);
  return ok(result);
}
