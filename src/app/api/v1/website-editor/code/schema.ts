import { z } from "zod";

// Schema for getting code by ID
export const getCodeRequestSchema = z.object({
  id: z.string().uuid({ message: "Valid code ID is required" }),
});
export type GetCodeRequestType = z.infer<typeof getCodeRequestSchema>;

// Schema for get code response
export const getCodeResponseSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
});
export type GetCodeResponseType = z.infer<typeof getCodeResponseSchema>;
