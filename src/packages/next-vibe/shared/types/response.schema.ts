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

export type ErrorResponseType<
  TResponseData,
  TErrorType extends ErrorResponseTypes = ErrorResponseTypes,
> = {
  success: false;
  message: string;
  errorType: TErrorType;
  data?: TResponseData;
} & (TErrorType extends ErrorResponseTypes.HTTP_ERROR
  ? { errorCode: number }
  : { errorCode?: never });

export interface SuccessResponseType<TResponseData> {
  success: true;
  data: TResponseData;
  message?: never;
  errorType?: never;
}

export enum ErrorResponseTypes {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  AUTH_ERROR = "AUTH_ERROR",
  NOT_FOUND = "NOT_FOUND",
  EMAIL_ERROR = "EMAIL_ERROR",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  NO_RESPONSE_DATA = "NO_RESPONSE_DATA",
  HTTP_ERROR = "HTTP_ERROR",
  SMS_ERROR = "SMS_ERROR",
  TOKEN_EXPIRED_ERROR = "TOKEN_EXPIRED_ERROR",
}
