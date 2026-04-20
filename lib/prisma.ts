import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function getRuntimeDatabaseUrl() {
  const rawUrl = process.env.DATABASE_URL;

  if (!rawUrl) {
    throw new Error("DATABASE_URL is not set. Configure Supabase Postgres before starting the app.");
  }

  const connectionUrl = new URL(rawUrl);

  if (!connectionUrl.searchParams.has("gssencmode")) {
    connectionUrl.searchParams.set("gssencmode", "disable");
  }

  if (!connectionUrl.searchParams.has("connect_timeout")) {
    connectionUrl.searchParams.set("connect_timeout", "30");
  }

  if (
    process.env.NODE_ENV !== "production" &&
    connectionUrl.hostname.endsWith("pooler.supabase.com") &&
    connectionUrl.port === "6543"
  ) {
    console.warn(
      "[db] DATABASE_URL is using Supavisor transaction mode (:6543). For a persistent local Next.js server, session mode (:5432) is recommended.",
    );
  }

  return connectionUrl.toString();
}

const adapter = new PrismaPg({
  connectionString: getRuntimeDatabaseUrl(),
});

export const prisma =
  global.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
