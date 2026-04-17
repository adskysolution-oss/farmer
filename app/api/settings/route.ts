import { getCurrentUser } from "@/lib/auth/session";
import { fail, ok } from "@/lib/http";
import { getSettingsBundle, updateSettingsBundle } from "@/lib/services/operations";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return fail("Unauthorized", 401);
  }

  return ok(await getSettingsBundle());
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return fail("Unauthorized", 401);
  }

  const body = await request.json();
  await updateSettingsBundle(body, user.id);
  return ok({ message: "Settings updated" });
}
