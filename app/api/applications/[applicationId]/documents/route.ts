import { getCurrentUser } from "@/lib/auth/session";
import { fail, ok } from "@/lib/http";
import { uploadApplicationDocument } from "@/lib/services/farmers";

export async function POST(request: Request, { params }: { params: Promise<{ applicationId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return fail("Unauthorized", 401);

  try {
    const { applicationId } = await params;
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as "AADHAAR" | "PAN" | "LAND_PAPER" | "BANK_DETAILS" | "OTHER";

    if (!file || !type) {
      return fail("File and document type are required", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Check if we need to replace and handle that (could logically delete old ones, but for now we'll just upload the new one).
    const document = await uploadApplicationDocument({
      applicationId,
      type,
      fileName: file.name,
      mimeType: file.type,
      buffer,
      uploadedById: user.id,
    });

    return ok(document);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to upload document");
  }
}
