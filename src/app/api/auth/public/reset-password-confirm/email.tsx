import { Section, Text } from "@react-email/components";
import type { EmailFunctionType } from "next-query-portal/server/email/handle-emails";
import type {
  MessageResponseType,
  UndefinedType,
} from "next-query-portal/shared";
import { APP_NAME } from "next-query-portal/shared/constants";

import { EmailTemplate } from "../../../../../config/email.template";
import { getFullUser } from "../../me/route";
import type { ResetPasswordConfirmType } from "./schema";

export const renderResetPasswordConfirmMail: EmailFunctionType<
  ResetPasswordConfirmType,
  MessageResponseType,
  UndefinedType
> = async ({ user }) => {
  const fullUser = await getFullUser(user.id);

  return {
    success: true,
    data: {
      toEmail: fullUser.email,
      toName: fullUser.firstName,
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
            Hello {fullUser.firstName},
          </Text>

          <Text
            style={{
              fontSize: "16px",
              lineHeight: "1.6",
              color: "#374151",
              marginBottom: "16px",
            }}
          >
            This email confirms that your password for your {APP_NAME} account
            has been successfully reset.
          </Text>

          <Text
            style={{
              fontSize: "16px",
              lineHeight: "1.6",
              color: "#374151",
              marginBottom: "16px",
            }}
          >
            You can now log in to your account using your new password.
          </Text>

          <Section style={{ marginTop: "24px" }}>
            <Text
              style={{
                fontSize: "14px",
                lineHeight: "1.5",
                color: "#6B7280",
              }}
            >
              If you did not request this password change, please contact our
              support team immediately as your account may have been
              compromised.
            </Text>
          </Section>
        </EmailTemplate>
      ),
    },
  };
};
