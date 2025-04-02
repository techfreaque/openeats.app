import { apiHandler } from "@/packages/next-vibe/server/endpoints/core/api-handler";

import definitions from "./definition";
import { createCategory, updateCategory } from "./route-handler";

export const POST = apiHandler({
  endpoint: definitions.POST,
  handler: createCategory,
  email: undefined,
});

export const PUT = apiHandler({
  endpoint: definitions.PUT,
  handler: updateCategory,
  email: undefined,
});
