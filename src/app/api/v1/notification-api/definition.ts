import type { ApiSection } from "next-vibe/shared/types/endpoint";

import connectionsEndpoint from "./connections/definition";
import sendEndpoint from "./send/definition";
import subscribeEndpoint from "./subscribe/definition";

/**
 * Combined notification API endpoints for API explorer
 */
const notificationApiEndpoints: ApiSection = {
  // Use the endpoints from the individual route folders
  connections: connectionsEndpoint,
  send: sendEndpoint,
  subscribe: subscribeEndpoint,
};

export default notificationApiEndpoints;
