import { getCurrentUser } from "@/lib/auth/session";
import { fail, ok } from "@/lib/http";
import { createCampaign, getCampaigns } from "@/lib/services/operations";

export async function GET() {
  const campaigns = await getCampaigns();
  return ok(campaigns);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return fail("Unauthorized", 401);
  }

  const body = await request.json();
  const result = await createCampaign(body, user.id);
  return ok(result, { status: 201 });
}
