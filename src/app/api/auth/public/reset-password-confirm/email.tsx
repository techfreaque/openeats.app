import { Button, Section, Text } from "@react-email/components";
import type { EmailTemplateReturnType } from "next-query-portal/server";
import type { UndefinedType } from "next-query-portal/shared";
import { APP_NAME } from "next-query-portal/shared";

import { EmailTemplate } from "../../../../../config/email.template";
import { env } from "../../../../../config/env";
import type { LoginResponseType } from "../login/login.schema";

export function renderRegisterMail({
  responseData,
}: {
  requestData: RegisterType;
  urlVariables: UndefinedType;
  responseData: LoginResponseType;
}): EmailTemplateReturnType {
  const baseUrl = env.NEXT_PUBLIC_FRONTEND_APP_URL;

  return {
    toEmail: responseData.user.email,
    toName: responseData.user.firstName,
    subject: `Welcome to ${APP_NAME}!`,
    jsx: (
      <EmailTemplate
        title={`Welcome to ${APP_NAME}, ${responseData.user.firstName}!`}
        previewText={`Your ${APP_NAME} account has been created successfully.`}
      >
        <Text
          style={{
            fontSize: "16px",
            lineHeight: "1.6",
            color: "#374151",
            marginBottom: "16px",
          }}
        >
          We're excited to have you on board. You can now start using your
          account to access all the features of {APP_NAME}.
        </Text>

        <Text
          style={{
            fontSize: "16px",
            lineHeight: "1.6",
            color: "#374151",
            marginBottom: "16px",
          }}
        >
          With your new account, you can:
        </Text>

        <ul style={{ color: "#374151", paddingLeft: "20px" }}>
          <li style={{ margin: "8px 0" }}>Manage your orders and deliveries</li>
          <li style={{ margin: "8px 0" }}>Track performance metrics</li>
          <li style={{ margin: "8px 0" }}>Access custom reports</li>
        </ul>

        <Section style={{ textAlign: "center", marginTop: "32px" }}>
          <Button
            href={`${baseUrl}/dashboard`}
            style={{
              backgroundColor: "#4f46e5",
              borderRadius: "6px",
              color: "#ffffff",
              fontSize: "16px",
              padding: "12px 24px",
              textDecoration: "none",
            }}
          >
            Get Started Now
          </Button>
        </Section>
      </EmailTemplate>
    ),
  };
}
