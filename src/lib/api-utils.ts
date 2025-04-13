import type { NextRequest } from "next/server";
import { getVerifiedUser } from "next-vibe/shared/utils/auth";

import { handleApiError } from "./utils";

export const getAuthenticatedUser = async (request: NextRequest) => {
  try {
    return await getVerifiedUser(request);
  } catch (error) {
    throw handleApiError(error, "getAuthenticatedUser");
  }
};

export const executeDbQuery = async <T>(
  query: () => Promise<T>,
  context: string,
): Promise<T> => {
  try {
    return await query();
  } catch (error) {
    throw handleApiError(error, context);
  }
};

export const validateApiRequest = async <T>(
  request: NextRequest,
  schema: any,
): Promise<T> => {
  try {
    const data = await request.json();
    return validateRequest(data, schema);
  } catch (error) {
    throw handleApiError(error, "validateApiRequest");
  }
};
