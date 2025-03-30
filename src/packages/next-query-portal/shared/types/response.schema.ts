import { z } from "zod";

export const messageResponseSchema = z.string();

export const errorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string(),
});

export type ResponseType<TResponseData> =
  | SuccessResponseType<TResponseData>
  | ErrorResponseType;

export type MessageResponseType = z.input<typeof messageResponseSchema>;

export interface ErrorResponseType {
  success: false;
  message: string;
  data?: never;
}

export interface SuccessResponseType<TResponseData> {
  success: true;
  data: TResponseData;
  message?: never;
}
