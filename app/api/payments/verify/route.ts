import { fail, ok } from "@/lib/http";
import { verifyPayment } from "@/lib/services/operations";

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.paymentId || !body.transactionId) {
    return fail("paymentId and transactionId are required", 422);
  }

  const result = await verifyPayment({
    paymentId: body.paymentId,
    transactionId: body.transactionId,
    success: Boolean(body.success),
  });

  return ok(result);
}
