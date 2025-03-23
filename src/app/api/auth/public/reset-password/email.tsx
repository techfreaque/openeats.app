import { Button, Section, Text } from "@react-email/components";
import type {
  MessageResponseType,
  UndefinedType,
} from "next-query-portal/shared";
import { APP_DOMAIN, APP_NAME } from "next-query-portal/shared";

import { EmailTemplate } from "../../../../../config/email.template";
import type { EmailFunctionType } from "../../../../../package/server/email/handle-emails";
import { db } from "../../../db";
import { generatePasswordResetToken } from "../reset-password-confirm/utils";
import type { ResetPasswordRequestType } from "./schema";

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
    return { success: false, message: "Email not found", errorCode: 404 };
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
            account. If you didn't make this request, you can safely ignore this
            email.
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
            please return to the login page and select "Forgot Password" again.
          </Text>
        </EmailTemplate>
      ),
    },
  };
};
