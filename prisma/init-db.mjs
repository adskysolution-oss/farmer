import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

console.warn(
  "[legacy-db:init] This script only bootstraps the legacy local SQLite file at prisma/dev.db. Primary app persistence uses Supabase Postgres via DATABASE_URL and DIRECT_URL.",
);

const dbPath = resolve(process.cwd(), "prisma", "dev.db");
const sqlPath = resolve(process.cwd(), "prisma", "init.sql");

const db = new DatabaseSync(dbPath);

db.exec("PRAGMA foreign_keys = ON;");
db.exec(readFileSync(sqlPath, "utf8"));

console.log(`Initialized SQLite schema at ${dbPath}`);
db.close();
