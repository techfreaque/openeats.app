import { apiHandler } from "@/packages/next-vibe/server/endpoints/core/api-handler";

import definitions from "./definition";

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
