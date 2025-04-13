import "dotenv/config";

import { debugLogger, errorLogger } from "next-vibe/shared";

import { closeDatabase } from "..";
import { createAdminUser } from "./utils";

async function seedDatabase(): Promise<void> {
  debugLogger("🌱 Seeding database...");

  await createAdminUser();

  debugLogger("✅ Database seeded successfully!");
}

seedDatabase()
  .catch((e) => {
    errorLogger("Error seeding database:", e);
    process.exit(1);
  })
  .finally(() => {
    void closeDatabase();
  })
  .catch((e) => {
    errorLogger("Error shutting down database:", e);
    process.exit(1);
  });
