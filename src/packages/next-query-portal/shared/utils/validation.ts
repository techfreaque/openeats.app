import type { z, ZodError } from "zod";

import type { SafeReturnType } from "../../server/endpoints/core/api-handler";

export function validateData<TSchema extends z.ZodType>(
  data: z.input<TSchema>,
  schema: TSchema,
): SafeReturnType<z.infer<TSchema>> {
  try {
    // Validate the data against the schema
    const result = schema.safeParse(data);

    if (!result.success) {
      const errorMessage = formatZodErrors(result.error);
      return { message: errorMessage, success: false, errorCode: 400 };
    }

    // For API responses, don't wrap the response in a success object, return the data directly
    return { data: result.data, success: true };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error validating response";
    return { message, success: false, errorCode: 400 };
  }
}

export function formatZodErrors(errors: ZodError): string {
  return errors.errors
    .map((err) => `${err.path.join(".")}: ${err.message}`)
    .join(", ");
}
