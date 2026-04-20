import { getCurrentUser } from "@/lib/auth/session";
import { fail, ok } from "@/lib/http";
import { profileInfo, profileSocial, profileBank } from "@/lib/services/admin/profile-service";

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return fail("Unauthorized", 401);
  }

  try {
    const { type, items } = await request.json();

    if (!items || !Array.isArray(items)) {
      return fail("Invalid items provided", 400);
    }

    switch (type) {
      case "info":
        await profileInfo.saveProfileInfo(items, user.id);
        break;
      case "social":
        await profileSocial.saveSocialInfo(items, user.id);
        break;
      case "bank":
        await profileBank.saveBankInfo(items, user.id);
        break;
      default:
        return fail("Invalid profile section type", 400);
    }

    return ok({ message: `${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully` });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to update profile", 500);
  }
}
