import { jwtVerify, SignJWT } from "jose";

const encoder = new TextEncoder();

export const SESSION_COOKIE = "loan_crm_session";

export type SessionPayload = {
  sub: string;
  role: "ADMIN" | "PARTNER" | "EMPLOYEE" | "CALLER";
  name: string;
};

function getSecret() {
  return encoder.encode(process.env.AUTH_SECRET || "change-me-in-production");
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function readSessionToken(token?: string) {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
