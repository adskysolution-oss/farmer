import { ok } from "@/lib/http";

export async function POST() {
  return ok({ message: "Razorpay webhook endpoint is ready for signature verification wiring." });
}
