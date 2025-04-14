import type { ApiSection } from "../shared/types/endpoint";
import { errorLogger } from "../shared/utils/logger";

/**
 * Get all API endpoints from the statically generated imports
 */
export function getEndpoints(): ApiSection {
  try {
    // Using dynamic import would be better, but for now we'll type it properly
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const importedModule = require("@/app/api/generated/endpoints");
    // Check if the module has the endpoints property
    if (
      importedModule &&
      typeof importedModule === "object" &&
      "endpoints" in importedModule
    ) {
      // Safe access to endpoints property
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const endpoints = importedModule.endpoints;
      // Validate that endpoints is an object
      if (endpoints && typeof endpoints === "object") {
        return endpoints as ApiSection;
      }
      return {};
    }
    return {};
  } catch (err) {
    errorLogger("Error loading API endpoints:", err);
    return {};
  }
}
