import { getCurrentUser } from "@/lib/auth/session";
import { fail, ok } from "@/lib/http";
import { createEmployee } from "@/lib/services/employees";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "PARTNER")) {
    return fail("Unauthorized", 401);
  }

  try {
    const body = await request.json();
    const result = await createEmployee(body, user.id);
    return ok(result, { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to create employee");
  }
}
