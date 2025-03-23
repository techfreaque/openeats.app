import { z } from "zod";

export const messageResponseSchema = z.string();

export const errorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string(),
});

export type ResponseType<TResponseData> =
  | SuccessResponseType<TResponseData>
  | ErrorResponseType<TResponseData>;

export type MessageResponseType = z.input<typeof messageResponseSchema>;

export type ErrorResponseType<TResponseData> = {
  data?: TResponseData;
  success: false;
  message: string;
};

export type SuccessResponseType<TResponseData> = {
  success: true;
  data: TResponseData;
};
