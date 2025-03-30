import { PrismaClient } from "@prisma/client";

import { env } from "../../../config/env";

let prisma: PrismaClient | undefined;

export const db =
  prisma ??
  new PrismaClient({
    log: ["query", "info", "warn", "error"],
  });

// Only cache the prisma instance in development
if (env.NODE_ENV !== "production") {
  prisma = db;
}
