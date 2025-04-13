import "server-only";

import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";

import definitions from "./definition";
import {
  renderRestaurantCreatedMail,
  renderRestaurantUpdatedMail,
} from "./email";
import {
  createRestaurant,
  getRestaurants,
  updateRestaurant,
} from "./route-handler";

/**
 * Restaurant API route handlers
 * Provides restaurant management functionality
 */

/**
 * GET handler for retrieving all restaurants
 */
export const GET = apiHandler({
  endpoint: definitions.GET,
  handler: getRestaurants,
  email: {}, // No emails for this endpoint
});

/**
 * POST handler for creating a new restaurant
 */
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

/**
 * PUT handler for updating a restaurant
 */
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
