import { getCurrentUser } from "@/lib/auth/session";
import { fail, ok } from "@/lib/http";
import { autoDistributeLeads } from "@/lib/services/operations";

export async function POST() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "PARTNER")) {
    return fail("Unauthorized", 401);
  }

  const result = await autoDistributeLeads(user);
  return ok(result);
}
