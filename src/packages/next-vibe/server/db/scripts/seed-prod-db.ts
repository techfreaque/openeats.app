import "dotenv/config";

import { debugLogger, errorLogger } from "next-vibe/shared";

import { closeDatabase } from "..";

async function seedDatabase(): Promise<void> {
  debugLogger("🌱 Seeding database...");

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
