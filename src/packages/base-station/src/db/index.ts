import fs from "fs";
import path from "path";
import type { Database } from "sqlite";
import { open } from "sqlite";
import sqlite3 from "sqlite3";

import logger from "../logging";

// Ensure the data directory exists
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "print-server.db");

// Initialize database
export async function initializeDatabase() {
  try {
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    // Enable foreign keys
    await db.exec("PRAGMA foreign_keys = ON");

    // Create tables if they don't exist
    await createTables(db);

    logger.info(`Database initialized at ${dbPath}`);
    return db;
  } catch (error) {
    logger.error("Failed to initialize database", error);
    throw error;
  }
}

async function createTables(db: Database<sqlite3.Database, sqlite3.Statement>) {
  // Print jobs table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS print_jobs (
      id TEXT PRIMARY KEY,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      file_name TEXT NOT NULL,
      printer TEXT,
      priority INTEGER DEFAULT 1,
      retries INTEGER DEFAULT 0,
      error TEXT,
      options TEXT,
      content BLOB
    )
  `);

  // Printer categories table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS printer_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      default_options TEXT
    )
  `);

  // Category printers junction table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS category_printers (
      category_id TEXT NOT NULL,
      printer_name TEXT NOT NULL,
      PRIMARY KEY (category_id, printer_name),
      FOREIGN KEY (category_id) REFERENCES printer_categories(id) ON DELETE CASCADE
    )
  `);

  // Routing rules table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS routing_rules (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      field TEXT NOT NULL,
      pattern TEXT NOT NULL,
      match_type TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES printer_categories(id) ON DELETE CASCADE
    )
  `);

  // Printer groups table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS printer_groups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      balancing_strategy TEXT NOT NULL,
      active BOOLEAN NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Group printers junction table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS group_printers (
      group_id TEXT NOT NULL,
      printer_name TEXT NOT NULL,
      priority INTEGER DEFAULT 1,
      PRIMARY KEY (group_id, printer_name),
      FOREIGN KEY (group_id) REFERENCES printer_groups(id) ON DELETE CASCADE
    )
  `);

  // Analytics table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS print_analytics (
      id TEXT PRIMARY KEY,
      job_id TEXT,
      printer TEXT,
      category TEXT,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      completed_at TEXT,
      duration INTEGER,
      page_count INTEGER,
      error TEXT
    )
  `);

  // Backup history table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS backup_history (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      size INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      status TEXT NOT NULL,
      error TEXT
    )
  `);

  // Sync history table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS sync_history (
      id TEXT PRIMARY KEY,
      started_at TEXT NOT NULL,
      completed_at TEXT,
      status TEXT NOT NULL,
      jobs_synced INTEGER DEFAULT 0,
      error TEXT
    )
  `);

  logger.info("Database tables created or verified");
}

// Export a singleton database instance
export const db = initializeDatabase();
