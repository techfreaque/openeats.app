// filepath: drizzle.config.ts
import type { Config } from "drizzle-kit";

export default {
  schema: ["./src/**/db.ts", "./src/**/*.db.ts"],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // eslint-disable-next-line node/no-process-env
    url: process.env["DATABASE_URL"]!,
  },
  extensionsFilters: ["postgis"],
  schemaFilter: "public",
  tablesFilter: "*",

  introspect: {
    casing: "camel",
  },

  migrations: {
    prefix: "timestamp",
    table: "__drizzle_migrations__",
    schema: "public",
  },

  breakpoints: true,
  strict: true,
  verbose: true,
} satisfies Config;
