import { apiHandler } from "@/packages/next-vibe/server/endpoints/core/api-handler";

import definitions from "./definition";
import { createCategory, getCategories, updateCategory } from "./route-handler";

export const GET = apiHandler({
  endpoint: definitions.GET,
  handler: getCategories,
  email: undefined,
});

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
