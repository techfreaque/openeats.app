import { debugLogger, errorLogger } from "next-vibe/shared/utils/logger";

export const handleApiError = (error: unknown, context: string) => {
  errorLogger(`Error in ${context}:`, error);
  return createErrorResponse("Internal server error", 500);
};

export const validateRequest = (data: unknown, schema: any) => {
  try {
    return schema.parse(data);
  } catch (error) {
    debugLogger("Validation error:", error);
    throw error;
  }
};

export const formatResponse = (data: unknown, message = "Success") => {
  return createSuccessResponse(data, message);
};
