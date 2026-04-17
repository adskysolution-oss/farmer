import { getCurrentUser } from "@/lib/auth/session";
import { fail, ok } from "@/lib/http";
import { deleteFarmer } from "@/lib/services/farmers";

export async function DELETE(_request: Request, { params }: { params: Promise<{ farmerId: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Unauthorized", 401);
  }

  try {
    const { farmerId } = await params;
    const farmer = await deleteFarmer(farmerId, user.id);
    return ok(farmer);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to delete farmer");
  }
}
