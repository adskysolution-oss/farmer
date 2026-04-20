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

  try {
    const { type, items, settings, gateways } = await request.json();

    // Support legacy updates (full bundle)
    if (settings || gateways) {
      await updateSettingsBundle({ settings, gateways }, user.id);
      return ok({ message: "Settings updated" });
    }

    // Support modular updates
    if (!items || !Array.isArray(items)) {
      return fail("Invalid items provided", 400);
    }

    // Direct database update via existing logic but supporting modular categorisation
    await updateSettingsBundle({ 
      settings: items.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {}) 
    }, user.id);

    return ok({ message: `${type ? type.charAt(0).toUpperCase() + type.slice(1) : "Settings"} updated successfully` });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to update settings", 500);
  }
}
