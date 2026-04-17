import { getCurrentUser } from "@/lib/auth/session";
import { fail, ok } from "@/lib/http";
import { resetPartnerPassword } from "@/lib/services/partners";

export async function POST(_request: Request, { params }: { params: Promise<{ partnerId: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return fail("Unauthorized", 401);
  }

  try {
    const { partnerId } = await params;
    const result = await resetPartnerPassword(partnerId, user.id);
    return ok(result);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to reset password");
  }
}
