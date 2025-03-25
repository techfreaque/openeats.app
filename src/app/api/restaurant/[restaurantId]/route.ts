import {
  restaurantCreateEndpoint,
  restaurantGetEndpoint,
  restaurantUpdateEndpoint,
} from "@/client-package/schema/api/v1/restaurant/restaurant";
import { apiHandler } from "@/next-portal/api/api-handler";

import {
  createRestaurant,
  getRestaurant,
  updateRestaurant,
} from "../../v1/restaurant/restaurant";

export const GET = apiHandler({
  endpoint: restaurantGetEndpoint,
  handler: getRestaurant,
});

export const POST = apiHandler({
  endpoint: restaurantCreateEndpoint,
  handler: createRestaurant,
});

export const PUT = apiHandler({
  endpoint: restaurantUpdateEndpoint,
  handler: updateRestaurant,
});
