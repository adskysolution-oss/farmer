import { getCurrentUser } from "@/lib/auth/session";
import { fail, ok } from "@/lib/http";
import { deletePartner, updatePartner } from "@/lib/services/partners";

export async function PUT(request: Request, { params }: { params: Promise<{ partnerId: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return fail("Unauthorized", 401);
  }

  try {
    const body = await request.json();
    const { partnerId } = await params;
    const partner = await updatePartner(partnerId, body, user.id);
    return ok(partner);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to update partner");
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ partnerId: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return fail("Unauthorized", 401);
  }

  try {
    const { partnerId } = await params;
    const partner = await deletePartner(partnerId, user.id);
    return ok(partner);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to delete partner");
  }
}
