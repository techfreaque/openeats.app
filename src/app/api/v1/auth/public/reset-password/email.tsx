import { Button, Section, Text } from "@react-email/components";
import type { EmailFunctionType } from "next-query-portal/server/email/handle-emails";
import { APP_DOMAIN, APP_NAME } from "next-query-portal/shared/constants";
import type { UndefinedType } from "next-query-portal/shared/types/common.schema";
import type { MessageResponseType } from "next-query-portal/shared/types/response.schema";

import { EmailTemplate } from "../../../../../../config/email.template";
import { db } from "../../../../db";
import type { ResetPasswordRequestType } from "./schema";
import { generatePasswordResetToken } from "./utils";

export const renderResetPasswordMail: EmailFunctionType<
  ResetPasswordRequestType,
  MessageResponseType,
  UndefinedType
> = async ({ requestData }) => {
  const existingUser = await db.user.findUnique({
    where: { email: requestData.email },
  });
  if (!existingUser) {
    // will not get sent to the user as ignoreError is true
    return { success: false, message: "Email not found", errorCode: 404 } as {
      success: false;
      message: string;
      errorCode: number;
      data?: never;
    };
  }
  const token = await generatePasswordResetToken(
    requestData.email,
    existingUser.id,
  );
  const passwordResetUrl = `${APP_DOMAIN}/reset-password?token=${token}`;
  return {
    success: true,
    data: {
      toEmail: requestData.email,
      toName: existingUser.firstName,
      subject: `Reset Your ${APP_NAME} Password`,
      jsx: (
        <EmailTemplate
          title={`Password Reset Request for ${APP_NAME}`}
          previewText={`Follow the instructions to reset your ${APP_NAME} account password.`}
        >
          <Text
            style={{
              fontSize: "16px",
              lineHeight: "1.6",
              color: "#374151",
              marginBottom: "16px",
            }}
          >
            Hello {existingUser.firstName},
          </Text>

          <Text
            style={{
              fontSize: "16px",
              lineHeight: "1.6",
              color: "#374151",
              marginBottom: "16px",
            }}
          >
            We received a request to reset your password for your {APP_NAME}{" "}
            account. If you {"didn't"} make this request, you can safely ignore
            this email.
          </Text>

          <Text
            style={{
              fontSize: "16px",
              lineHeight: "1.6",
              color: "#374151",
              marginBottom: "16px",
            }}
          >
            To reset your password, please click the button below:
          </Text>

          <Section style={{ textAlign: "center", marginTop: "32px" }}>
            <Button
              href={passwordResetUrl}
              style={{
                backgroundColor: "#4f46e5",
                borderRadius: "6px",
                color: "#ffffff",
                fontSize: "16px",
                padding: "12px 24px",
                textDecoration: "none",
              }}
            >
              Reset Password
            </Button>
          </Section>

          <Text
            style={{
              fontSize: "14px",
              lineHeight: "1.5",
              color: "#6B7280",
              marginTop: "24px",
            }}
          >
            This link will expire in 24 hours. If you need a new reset link,
            please return to the login page and select &quot;Forgot
            Password&quot; again.
          </Text>
        </EmailTemplate>
      ),
    },
  };
};
