import "dotenv/config";

import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/node-postgres/migrator";

import { debugLogger, errorLogger } from "../../../shared/utils/logger";
import { db, rawPool } from "../index";

/**
 * Run database migrations
 */
async function runMigrations(): Promise<void> {
  try {
    debugLogger("Running migrations...");

    // Check if database needs initialization
    const needsInit = await needsInitialization();

    if (needsInit) {
      debugLogger("Database needs initialization, creating schema...");
      await initializeDatabase();
    } else {
      // Run migrations normally
      await migrate(db, { migrationsFolder: "drizzle" });
    }

    debugLogger("Migrations completed successfully");
  } catch (error) {
    errorLogger(error);
    throw error;
  } finally {
    await rawPool.end();
  }
}

/**
 * Check if the database needs initialization
 */
async function needsInitialization(): Promise<boolean> {
  try {
    // Check if any tables exist in the public schema
    const result = await db.execute(sql`
      SELECT COUNT(*) as table_count
      FROM information_schema.tables
      WHERE table_schema = 'public';
    `);

    const tableCount = parseInt(String(result[0]?.table_count ?? "0"), 10);
    return tableCount === 0;
  } catch (error) {
    // If there's an error, assume we need to initialize
    errorLogger("Error checking database state:", error);
    return true;
  }
}

/**
 * Check if a specific table exists
 */
async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = ${tableName}
      );
    `);

    return Boolean(result[0]?.exists);
  } catch (error) {
    errorLogger(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
}

/**
 * Check if enum types exist
 */
async function checkEnumTypesExist(): Promise<boolean> {
  try {
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM pg_type
        WHERE typname = 'user_role_value'
      );
    `);

    return Boolean(result[0]?.exists);
  } catch (error) {
    // If there's an error, assume the types exist to be safe
    errorLogger("Error checking if enum types exist:", error);
    return true;
  }
}

/**
 * Initialize the database from scratch
 */
async function initializeDatabase(): Promise<void> {
  try {
    // Check if enum types exist
    const enumTypesExist = await checkEnumTypesExist();

    if (!enumTypesExist) {
      // Create enum types with IF NOT EXISTS
      await db.execute(sql`
        -- Create user_role_value enum if it doesn't exist
        DO $$ BEGIN
          CREATE TYPE "public"."user_role_value" AS ENUM('PUBLIC', 'CUSTOMER', 'PARTNER_ADMIN', 'PARTNER_EMPLOYEE', 'COURIER', 'ADMIN');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;

        -- Create country enum if it doesn't exist
        DO $$ BEGIN
          CREATE TYPE "public"."country" AS ENUM('DE', 'AT', 'CH');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;

        -- Create currency enum if it doesn't exist
        DO $$ BEGIN
          CREATE TYPE "public"."currency" AS ENUM('EUR', 'CHF');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;

        -- Create day enum if it doesn't exist
        DO $$ BEGIN
          CREATE TYPE "public"."day" AS ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);

      debugLogger("Created enum types");
    } else {
      debugLogger("Enum types already exist, skipping creation");
    }

    // Check if users table exists
    const usersTableExists = await checkTableExists("users");

    if (!usersTableExists) {
      // Create users table
      try {
        await db.execute(sql`
          -- Create users table
          CREATE TABLE "users" (
            "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
            "email" text NOT NULL,
            "password" text NOT NULL,
            "first_name" text NOT NULL,
            "last_name" text NOT NULL,
            "image_url" text,
            "created_at" timestamp DEFAULT now() NOT NULL,
            "updated_at" timestamp DEFAULT now() NOT NULL,
            CONSTRAINT "users_email_unique" UNIQUE("email")
          );
        `);

        debugLogger("Created users table");
      } catch (error) {
        // Table might have been created by another process
        debugLogger("Error creating users table, might already exist");
      }
    } else {
      debugLogger("Users table already exists, skipping creation");
    }

    // Check if partners table exists
    const partnersTableExists = await checkTableExists("partners");

    if (!partnersTableExists) {
      // Create partners table
      try {
        await db.execute(sql`
          -- Create partners table
          CREATE TABLE "partners" (
            "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
            "name" text NOT NULL,
            "description" text,
            "email" text NOT NULL,
            "phone" text NOT NULL,
            "street" text NOT NULL,
            "street_number" text NOT NULL,
            "zip" text NOT NULL,
            "city" text NOT NULL,
            "country" "country" NOT NULL,
            "latitude" numeric NOT NULL,
            "longitude" numeric NOT NULL,
            "currency" "currency" NOT NULL,
            "is_active" boolean DEFAULT true NOT NULL,
            "is_open" boolean DEFAULT false NOT NULL,
            "image_url" text,
            "rating" numeric DEFAULT '0' NOT NULL,
            "rating_recent" numeric DEFAULT '0' NOT NULL,
            "rating_count" numeric DEFAULT '0' NOT NULL,
            "delivery_radius" numeric NOT NULL,
            "delivery_fee" numeric NOT NULL,
            "minimum_order_amount" numeric NOT NULL,
            "created_at" timestamp DEFAULT now() NOT NULL,
            "updated_at" timestamp DEFAULT now() NOT NULL
          );
        `);

        debugLogger("Created partners table");
      } catch (error) {
        // Table might have been created by another process
        debugLogger("Error creating partners table, might already exist");
      }
    } else {
      debugLogger("Partners table already exists, skipping creation");
    }

    debugLogger("Database initialized with essential tables");
  } catch (error) {
    errorLogger("Error initializing database:", error);
    throw error;
  }
}

runMigrations().catch(errorLogger);
