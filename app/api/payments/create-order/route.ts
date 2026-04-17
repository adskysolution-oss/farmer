import { fail, ok } from "@/lib/http";
import { createPublicApplication } from "@/lib/services/operations";

export async function POST(request: Request) {
  const formData = await request.formData();
  const input = Object.fromEntries(formData.entries());

  try {
    const result = await createPublicApplication(input, typeof input.gateway === "string" ? input.gateway : undefined);
    return ok(result, { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to create payment order");
  }
}
