import type { z } from "zod";

import type {
  getUiDetailRequestSchema,
  getUiDetailResponseSchema,
} from "./definition";

/**
 * Type for the request to get UI details
 */
export type GetUiDetailRequestType = z.infer<typeof getUiDetailRequestSchema>;

/**
 * Type for the response from getting UI details
 */
export type GetUiDetailResponseType = z.infer<typeof getUiDetailResponseSchema>;
