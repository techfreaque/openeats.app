import { Section, Text } from "@react-email/components";
import type { EmailFunctionType } from "next-vibe/server/email/handle-emails";
import { APP_NAME } from "next-vibe/shared/constants";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";
import { ErrorResponseTypes } from "next-vibe/shared/types/response.schema";

import { EmailTemplate } from "../../../../../../config/email.template";
import { userRepository } from "../../repository";
import type { ResetPasswordConfirmType } from "./schema";

export const renderResetPasswordConfirmMail: EmailFunctionType<
  ResetPasswordConfirmType,
  string,
  UndefinedType
> = async ({ requestData }) => {
  const user = await userRepository.findByEmail(requestData.email);
  if (!user) {
    return {
      success: false,
      message: "User not found",
      errorType: ErrorResponseTypes.NOT_FOUND,
      errorCode: 404,
    };
  }

  return {
    success: true,
    data: {
      toEmail: requestData.email,
      toName: user.firstName,
      subject: `Your ${APP_NAME} Password Has Been Reset`,
      jsx: (
        <EmailTemplate
          title={`Password Reset Confirmation for ${APP_NAME}`}
          previewText={`Your ${APP_NAME} account password has been successfully reset.`}
        >
          <Text
            style={{
              fontSize: "16px",
              lineHeight: "1.6",
              color: "#374151",
              marginBottom: "16px",
            }}
          >
            Hello {user.firstName},
          </Text>

          <Text
            style={{
              fontSize: "16px",
              lineHeight: "1.6",
              color: "#374151",
              marginBottom: "16px",
            }}
          >
            Your password for your {APP_NAME} account has been successfully
            reset.
          </Text>

          <Text
            style={{
              fontSize: "16px",
              lineHeight: "1.6",
              color: "#374151",
              marginBottom: "16px",
            }}
          >
            You can now log in to your account with your new password.
          </Text>

          <Section style={{ marginTop: "32px" }}>
            <Text
              style={{
                fontSize: "16px",
                lineHeight: "1.6",
                color: "#374151",
                marginBottom: "16px",
              }}
            >
              If you did not request this password change, please contact our
              support team immediately.
            </Text>
          </Section>

          <Text
            style={{
              fontSize: "14px",
              lineHeight: "1.5",
              color: "#6B7280",
              marginTop: "24px",
            }}
          >
            For security reasons, we recommend changing your password regularly
            and using a unique password that you don&apos;t use for other
            services.
          </Text>
        </EmailTemplate>
      ),
    },
  };
};
