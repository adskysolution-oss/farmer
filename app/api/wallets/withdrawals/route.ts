import { getCurrentUser } from "@/lib/auth/session";
import { fail, ok } from "@/lib/http";
import { listWithdrawals } from "@/lib/services/operations";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Unauthorized", 401);
  }

  const withdrawals = await listWithdrawals(user);
  return ok(withdrawals);
}
