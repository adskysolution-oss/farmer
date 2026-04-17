import { getCurrentUser } from "@/lib/auth/session";
import { fail, ok } from "@/lib/http";
import { getTrackingSnapshot, updateTrackingHeartbeat } from "@/lib/services/operations";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Unauthorized", 401);
  }

  return ok(await getTrackingSnapshot(user));
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !user.employee) {
    return fail("Unauthorized", 401);
  }

  const body = await request.json();
  const result = await updateTrackingHeartbeat({
    employeeId: user.employee.id,
    latitude: Number(body.latitude),
    longitude: Number(body.longitude),
  });
  return ok(result, { status: 201 });
}
