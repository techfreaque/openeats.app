import "dotenv/config";

import { readFileSync, writeFileSync } from "fs";
import { PrismaDatabaseProvider } from "next-vibe/server/endpoints/data";
import { validateEnv } from "next-vibe/shared/utils/env-util";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_PROVIDER: z.nativeEnum(PrismaDatabaseProvider),
});
const env = validateEnv(
  // eslint-disable-next-line node/no-process-env
  process.env,
  envSchema,
);

const template = readFileSync("prisma/schema.prisma.template", "utf8");
const schema = template.replace("__DB_PROVIDER__", env.DATABASE_PROVIDER);
writeFileSync("prisma/schema.prisma", schema);
// eslint-disable-next-line no-console
console.log(
  `✅ Generated prisma/schema.prisma using provider: ${env.DATABASE_PROVIDER}`,
);
