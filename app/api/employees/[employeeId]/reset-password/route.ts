import { getCurrentUser } from "@/lib/auth/session";
import { fail, ok } from "@/lib/http";
import { resetEmployeePassword } from "@/lib/services/employees";

export async function POST(_request: Request, { params }: { params: Promise<{ employeeId: string }> }) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "PARTNER")) {
    return fail("Unauthorized", 401);
  }

  try {
    const { employeeId } = await params;
    const result = await resetEmployeePassword(employeeId, user.id);
    return ok(result);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to reset password");
  }
}
