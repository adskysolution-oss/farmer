import { ok } from "@/lib/http";

export async function POST() {
  return ok({ message: "PhonePe webhook endpoint is ready for provider verification wiring." });
}
