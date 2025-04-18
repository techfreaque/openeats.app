import "dotenv/config";

import { sql } from "drizzle-orm";
import fs from "fs";
import path from "path";

import { debugLogger, errorLogger } from "../../../shared/utils/logger";
import { db, rawPool } from "../index";

/**
 * Initialize the database by dropping all tables and recreating them
 */
async function initializeDatabase(): Promise<void> {
  debugLogger("Initializing database...");

  try {
    // Drop all tables
    await db.execute(sql`
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO postgres;
      GRANT ALL ON SCHEMA public TO public;
    `);

    debugLogger("Dropped all tables");

    // Read all migration files
    const migrationsDir = path.join(process.cwd(), "drizzle");
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    // Execute each migration file
    for (const migrationFile of migrationFiles) {
      const migrationPath = path.join(migrationsDir, migrationFile);
      const migrationSql = fs.readFileSync(migrationPath, "utf8");

      debugLogger(`Executing migration: ${migrationFile}`);
      await db.execute(sql.raw(migrationSql));
    }

    debugLogger("Database initialized successfully");
  } catch (error) {
    errorLogger("Error initializing database:", error);
    throw error;
  } finally {
    await rawPool.end();
  }
}

initializeDatabase().catch(errorLogger);
