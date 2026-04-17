import { getCurrentUser } from "@/lib/auth/session";
import { fail, ok } from "@/lib/http";
import { bulkImportLeads } from "@/lib/services/operations";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "PARTNER")) {
    return fail("Unauthorized", 401);
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return fail("Please upload a spreadsheet file", 400);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await bulkImportLeads(buffer, user.id);
  return ok(result);
}
