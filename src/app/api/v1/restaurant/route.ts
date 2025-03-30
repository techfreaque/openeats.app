import { apiHandler } from "@/packages/next-vibe/server/endpoints/core/api-handler";

import definitions from "./definition";
import {
  renderRestaurantCreatedMail,
  renderRestaurantUpdatedMail,
} from "./email";
import {
  createRestaurant,
  getRestaurant,
  updateRestaurant,
} from "./route-handler";

export const GET = apiHandler({
  endpoint: definitions.GET,
  handler: getRestaurant,
  email: undefined,
});

export const POST = apiHandler({
  endpoint: definitions.POST,
  handler: createRestaurant,
  email: {
    afterHandlerEmails: [
      {
        render: renderRestaurantCreatedMail,
      },
    ],
  },
});

export const PUT = apiHandler({
  endpoint: definitions.PUT,
  handler: updateRestaurant,
  email: {
    afterHandlerEmails: [
      {
        render: renderRestaurantUpdatedMail,
      },
    ],
  },
});
