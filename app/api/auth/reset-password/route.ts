import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";

import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validators/auth";

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = resetPasswordSchema.safeParse(json);

  if (!parsed.success) {
    return fail("Please enter a valid reset token and password", 422, parsed.error.flatten());
  }

  const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return fail("This reset token is invalid or has expired", 400);
  }

  await prisma.user.update({
    where: { id: resetToken.userId },
    data: {
      passwordHash: await bcrypt.hash(parsed.data.password, 10),
    },
  });

  await prisma.passwordResetToken.update({
    where: { id: resetToken.id },
    data: { usedAt: new Date() },
  });

  return ok({ message: "Password updated successfully" });
}
