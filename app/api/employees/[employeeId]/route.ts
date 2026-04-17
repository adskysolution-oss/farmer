import { getCurrentUser } from "@/lib/auth/session";
import { fail, ok } from "@/lib/http";
import { deleteEmployee, updateEmployee } from "@/lib/services/employees";

export async function PUT(request: Request, { params }: { params: Promise<{ employeeId: string }> }) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "PARTNER")) {
    return fail("Unauthorized", 401);
  }

  try {
    const body = await request.json();
    const { employeeId } = await params;
    const employee = await updateEmployee(employeeId, body, user.id);
    return ok(employee);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to update employee");
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ employeeId: string }> }) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "PARTNER")) {
    return fail("Unauthorized", 401);
  }

  try {
    const { employeeId } = await params;
    const employee = await deleteEmployee(employeeId, user.id);
    return ok(employee);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to delete employee");
  }
}
