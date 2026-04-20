import { getCurrentUser } from "@/lib/auth/session";
import { fail, ok } from "@/lib/http";
import { profileUserId } from "@/lib/services/admin/profile-service";

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return fail("Unauthorized", 401);
  }

  try {
    const { name, email } = await request.json();

    if (name) profileUserId.validateUserName(name);
    if (email) profileUserId.validateUserEmail(email);

    await profileUserId.saveUserIdInfo(user.id, { name, email });

    return ok({ message: "User identity updated successfully" });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to update identity", 500);
  }
}
