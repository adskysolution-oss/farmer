import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const rawUrl = process.env.DATABASE_URL;

if (!rawUrl) {
  throw new Error("DATABASE_URL is not set. Configure Supabase Postgres before running db:check.");
}

const connectionUrl = new URL(rawUrl);

if (!connectionUrl.searchParams.has("gssencmode")) {
  connectionUrl.searchParams.set("gssencmode", "disable");
}

if (!connectionUrl.searchParams.has("connect_timeout")) {
  connectionUrl.searchParams.set("connect_timeout", "30");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: connectionUrl.toString() }),
  log: ["error"],
});

try {
  const [users, farmers, applications, payments] = await Promise.all([
    prisma.user.count(),
    prisma.farmer.count(),
    prisma.loanApplication.count(),
    prisma.payment.count(),
  ]);

  console.log(
    JSON.stringify(
      {
        users,
        farmers,
        applications,
        payments,
      },
      null,
      2,
    ),
  );
} catch (error) {
  console.error("[db:check] Unable to query Supabase through Prisma.");
  console.error(error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
