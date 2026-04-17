import { createHash, randomBytes } from "node:crypto";

import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validators/auth";

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = forgotPasswordSchema.safeParse(json);

  if (!parsed.success) {
    return fail("Please provide a valid registered mobile or email", 422, parsed.error.flatten());
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ mobile: parsed.data.identifier }, { email: parsed.data.identifier }],
    },
  });

  if (!user) {
    return fail("No matching account was found", 404);
  }

  const rawToken = randomBytes(24).toString("hex");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 1000 * 60 * 30),
    },
  });

  const resetUrl = `${process.env.APP_URL || "http://localhost:3000"}/reset-password?token=${rawToken}`;
  return ok({
    message: "Password reset token generated",
    resetUrl: process.env.NODE_ENV === "production" ? undefined : resetUrl,
  });
}
