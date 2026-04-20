import { getCurrentUser } from "@/lib/auth/session";
import { fail, ok } from "@/lib/http";
import { updateApplication } from "@/lib/services/farmers";

export async function PUT(request: Request, { params }: { params: Promise<{ applicationId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return fail("Unauthorized", 401);

  try {
    const { applicationId } = await params;
    const body = await request.json();
    const updated = await updateApplication(applicationId, body, user.id);
    return ok(updated);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to update application");
  }
}
