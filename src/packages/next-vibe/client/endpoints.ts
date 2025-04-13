import type { ApiSection } from "../shared/types/endpoint";
import { errorLogger } from "../shared/utils/logger";

/**
 * Get all API endpoints from the statically generated imports
 */
export function getEndpoints(): ApiSection {
  try {
    const endpoints = require("@/app/api/generated/endpoints")
      ?.endpoints as ApiSection;
    return endpoints || {};
  } catch (err) {
    errorLogger("Error loading API endpoints:", err);
    return {};
  }
}
