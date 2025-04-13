import "dotenv/config";

import { migrate } from "drizzle-orm/node-postgres/migrator";
import { debugLogger, errorLogger } from "next-vibe/shared";

import { db, rawPool } from "../index";

async function runMigrations(): Promise<void> {
  debugLogger("Running migrations...");
  await migrate(db, { migrationsFolder: "drizzle" });
  debugLogger("Migrations completed");
  await rawPool.end();
}

runMigrations().catch(errorLogger);
