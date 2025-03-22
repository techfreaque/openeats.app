import { z } from "zod";

export const messageResponseSchema = z.string();

export const errorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string(),
});

export const successResponseSchema = z.object({
  success: z.literal(true),
  data: z.string().nullable(),
});

export type ResponseType<TResponseData> =
  | SuccessResponseType<TResponseData>
  | ErrorResponseType;

export type MessageResponseType = z.input<typeof messageResponseSchema>;
export type ErrorResponseType = {
  success: false;
  message: string;
};

export type SuccessResponseType<T> = {
  success: true;
  data: T;
};
