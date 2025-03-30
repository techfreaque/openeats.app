import "server-only";

import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";

import loginEndpoint from "./definition";
import { loginUser } from "./route-handler";

export const POST = apiHandler({
  endpoint: loginEndpoint.POST,
  handler: loginUser,
  email: undefined,
});
