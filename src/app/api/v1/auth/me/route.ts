import "server-only";

import { apiHandler } from "next-query-portal/server/endpoints/core/api-handler";

import meEndpoint from "./definition";
import { getUser } from "./route-handler/get-me";
import { updateUser } from "./route-handler/update-me";

export const GET = apiHandler({
  endpoint: meEndpoint.GET,
  handler: getUser,
  email: undefined,
});

export const POST = apiHandler({
  endpoint: meEndpoint.POST,
  handler: updateUser,
  email: undefined,
});
