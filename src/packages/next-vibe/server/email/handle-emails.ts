import type { UndefinedType } from "next-vibe/shared/types/common.schema";
import type { JSX } from "react";

import type { JwtPayloadType } from "../endpoints/auth/jwt";
import type { SafeReturnType } from "../endpoints/core/api-handler";
import { env } from "../env";
import { sendEmail, type SendEmailParams } from "./send-mail";

export type EmailFunctionType<TRequest, TResponse, TUrlVariables> = ({
  requestData,
}: EmailRenderProps<TRequest, TResponse, TUrlVariables>) =>
  | Promise<SafeReturnType<EmailTemplateReturnType>>
  | SafeReturnType<EmailTemplateReturnType>;

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
}): Promise<SafeReturnType<UndefinedType>> {
  const errors: string[] = [];
  if (email?.afterHandlerEmails) {
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
  }
  if (errors.length) {
    return {
      success: false,
      message: errors.join(", "),
      errorCode: 500,
    };
  }
  return { success: true, data: undefined };
}
