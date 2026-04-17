import { getCurrentUser } from "@/lib/auth/session";
import { fail, ok } from "@/lib/http";
import { recordCallFeedback } from "@/lib/services/operations";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !user.employee) {
    return fail("Unauthorized", 401);
  }

  const body = await request.json();
  const result = await recordCallFeedback({
    applicationId: body.applicationId,
    callerId: user.employee.id,
    connectionStatus: body.connectionStatus,
    interestStatus: body.interestStatus,
    notes: body.notes,
    followUpDate: body.followUpDate,
  });

  return ok(result);
}
