import bcrypt from "bcryptjs";

import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators/auth";

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = loginSchema.safeParse(json);

  if (!parsed.success) {
    return fail("Please enter a valid mobile/email and password", 422, parsed.error.flatten());
  }

  const { identifier, password } = parsed.data;
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ mobile: identifier }, { email: identifier }],
    },
  });

  if (!user) {
    return fail("No account found for those credentials", 401);
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    return fail("Incorrect password", 401);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const token = await createSessionToken({
    sub: user.id,
    role: user.role,
    name: user.name,
  });

  await setSessionCookie(token);

  return ok({ user: { id: user.id, name: user.name, role: user.role } });
}
