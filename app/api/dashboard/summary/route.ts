import { getCurrentUser } from "@/lib/auth/session";
import { fail, ok } from "@/lib/http";
import { getDashboardSummary } from "@/lib/services/dashboard";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Unauthorized", 401);
  }

  const summary = await getDashboardSummary(user);
  return ok(summary);
}
