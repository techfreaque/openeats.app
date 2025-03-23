import { errorLogger } from "next-query-portal/shared/utils/logger";

import { endpoints } from "@/app/api/generated/endpoints";

import type { ApiSection } from "../shared/types/endpoint";

/**
 * Get all API endpoints from the statically generated imports
 */
export function getEndpoints(): ApiSection {
  try {
    return endpoints;
  } catch (err) {
    errorLogger("Error loading API endpoints:", err);
    return {};
  }
}
