import { getCurrentUser } from "@/lib/auth/session";
import { fail, ok } from "@/lib/http";
import { createFarmerApplication } from "@/lib/services/farmers";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Unauthorized", 401);
  }

  try {
    const body = await request.json();
    const result = await createFarmerApplication(body, user.id);
    return ok(result, { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to create farmer application");
  }
}
