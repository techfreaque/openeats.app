import type { UndefinedType } from "next-vibe/shared/types/common.schema";
import type { JSX } from "react";

import type { JwtPayloadType } from "../endpoints/auth/jwt";
import { env } from "../env";
import { sendEmail, type SendEmailParams } from "./send-mail";

export type EmailFunctionType<TRequest, TResponse, TUrlVariables> = ({
  requestData,
}: EmailRenderProps<TRequest, TResponse, TUrlVariables>) =>
  | Promise<{ success: true; data: EmailTemplateReturnType; status?: number } | { success: false; message: string; errorCode: number }>
  | { success: true; data: EmailTemplateReturnType; status?: number } | { success: false; message: string; errorCode: number };

export interface EmailRenderProps<TRequest, TResponse, TUrlVariables> {
  requestData: TRequest;
  urlVariables: TUrlVariables;
  responseData: TResponse;
  user: JwtPayloadType;
}

export interface EmailTemplateReturnType {
  jsx: JSX.Element;
  subject: string;
  fromName?: string;
  fromEmail?: string;
  toEmail: string;
  toName: string;
  replyToEmail?: string;
}

export async function handleEmails<TRequest, TResponse, TUrlVariables>({
  email,
  user,
  responseData,
  urlVariables,
  requestData,
}: {
  email:
    | {
        afterHandlerEmails?: {
          ignoreErrors?: boolean;
          render: EmailFunctionType<TRequest, TResponse, TUrlVariables>;
        }[];
      }
    | undefined;
  user: JwtPayloadType;
  responseData: TResponse;
  urlVariables: TUrlVariables;
  requestData: TRequest;
}): Promise<{ success: true; data: UndefinedType; status?: number } | { success: false; message: string; errorCode: number }> {
  const errors: string[] = [];
  if (email?.afterHandlerEmails) {
    try {
      await Promise.all(
        email.afterHandlerEmails.map(async (emailData) => {
          const emailMessage = await emailData.render({
            user,
            urlVariables,
            requestData,
            responseData,
          });
          if (!emailMessage.success) {
            if (!emailData.ignoreErrors) {
              errors.push(emailMessage.message);
            }
            return;
          }
          const _emailData: SendEmailParams = {
            fromEmail: env.EMAIL_FROM_EMAIL,
            fromName: env.EMAIL_FROM_NAME,
            ...emailMessage.data,
          };
          const emailResponse = await sendEmail(_emailData);
          if (!emailData.ignoreErrors && !emailResponse.success) {
            errors.push(emailResponse.message);
          }
        }),
      );
    } catch (error) {
      errors.push(
        `Error sending emails: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
  if (errors.length) {
    return {
      success: false,
      message: errors.join(", "),
      errorCode: 500,
    };
  }
  return { success: true, data: undefined, status: 200 };
}
