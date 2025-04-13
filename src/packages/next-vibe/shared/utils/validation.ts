import type { z, ZodError } from "zod";

import {
  ErrorResponseTypes,
  type ResponseType,
} from "../types/response.schema";

export function validateData<TSchema extends z.ZodType>(
  data: z.input<TSchema>,
  schema: TSchema,
): ResponseType<z.infer<TSchema>> {
  try {
    // Validate the data against the schema
    const result = schema.safeParse(data);

    if (!result.success) {
      const errorMessage = formatZodErrors(result.error);
      return {
        message: errorMessage,
        success: false,
        errorType: ErrorResponseTypes.VALIDATION_ERROR,
      };
    }

    // For API responses, don't wrap the response in a success object, return the data directly
    return { data: result.data, success: true };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error validating response";
    return {
      message,
      success: false,
      errorType: ErrorResponseTypes.VALIDATION_ERROR,
    };
  }
}

export function formatZodErrors(errors: ZodError): string {
  return errors.errors
    .map((err) => `${err.path.join(".")}: ${err.message}`)
    .join(", ");
}
