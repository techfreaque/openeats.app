import { endpoints } from "@/app/api/generated/endpoints";

import type { ApiSection } from "../shared/types/endpoint";
import { errorLogger } from "../shared/utils/logger";

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
