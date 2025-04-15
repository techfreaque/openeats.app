import { createEndpoint } from "next-vibe/client/endpoint";
import { undefinedSchema } from "next-vibe/shared/types/common.schema";
import { Methods } from "next-vibe/shared/types/endpoint";
import { UserRoleValue } from "next-vibe/shared/types/enums";

import {
  reviewCreateSchema,
  reviewResponseSchema,
  reviewsResponseSchema,
  reviewUpdateSchema,
} from "./schema";

/**
 * Reviews API endpoint definitions
 */

/**
 * GET endpoint for retrieving reviews
 */
const getReviewsEndpoint = createEndpoint({
  description: "Get reviews for a restaurant or by a user",
  requestSchema: undefinedSchema,
  responseSchema: reviewsResponseSchema,
  path: ["v1", "reviews"],
  method: Methods.GET,
  allowedRoles: [UserRoleValue.PUBLIC],
  requestUrlSchema: undefinedSchema,
  apiQueryOptions: {
    queryKey: ["reviews"],
  },
  errorCodes: {
    400: "Invalid request data",
    500: "Internal server error",
  },
});

/**
 * POST endpoint for creating a new review
 */
const createReviewEndpoint = createEndpoint({
  description: "Create a new review",
  requestSchema: reviewCreateSchema,
  responseSchema: reviewResponseSchema,
  path: ["v1", "reviews"],
  method: Methods.POST,
  allowedRoles: [UserRoleValue.CUSTOMER],
  requestUrlSchema: undefinedSchema,
  apiQueryOptions: {
    queryKey: ["reviews-create"],
    disableLocalCache: true,
  },
  errorCodes: {
    400: "Invalid request data",
    401: "Not authenticated",
    404: "Restaurant not found",
    500: "Internal server error",
  },
});

/**
 * PUT endpoint for updating a review
 */
const updateReviewEndpoint = createEndpoint({
  description: "Update an existing review",
  requestSchema: reviewUpdateSchema,
  responseSchema: reviewResponseSchema,
  path: ["v1", "reviews", ":id"],
  method: Methods.PUT,
  allowedRoles: [UserRoleValue.CUSTOMER],
  requestUrlSchema: undefinedSchema,
  apiQueryOptions: {
    queryKey: ["reviews-update"],
    disableLocalCache: true,
  },
  errorCodes: {
    400: "Invalid request data",
    401: "Not authenticated",
    403: "Not authorized to update this review",
    404: "Review not found",
    500: "Internal server error",
  },
});

/**
 * DELETE endpoint for deleting a review
 */
const deleteReviewEndpoint = createEndpoint({
  description: "Delete a review",
  requestSchema: undefinedSchema,
  responseSchema: undefinedSchema,
  path: ["v1", "reviews", ":id"],
  method: Methods.DELETE,
  allowedRoles: [UserRoleValue.CUSTOMER, UserRoleValue.ADMIN],
  requestUrlSchema: undefinedSchema,
  apiQueryOptions: {
    queryKey: ["reviews-delete"],
    disableLocalCache: true,
  },
  errorCodes: {
    401: "Not authenticated",
    403: "Not authorized to delete this review",
    404: "Review not found",
    500: "Internal server error",
  },
});

const reviewsEndpoints = {
  GET: getReviewsEndpoint,
  POST: createReviewEndpoint,
  PUT: updateReviewEndpoint,
  DELETE: deleteReviewEndpoint,
};

export default reviewsEndpoints;
