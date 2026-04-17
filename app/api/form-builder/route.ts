import { getCurrentUser } from "@/lib/auth/session";
import { fail, ok } from "@/lib/http";
import { updateFormDefinition } from "@/lib/services/operations";

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return fail("Unauthorized", 401);
  }

  const body = await request.json();
  const result = await updateFormDefinition(body, user.id);
  return ok(result);
}
