import { Button, Section, Text } from "@react-email/components";
import type { EmailFunctionType } from "next-vibe/server/email/handle-emails";
import { APP_NAME } from "next-vibe/shared/constants";
import { debugLogger } from "next-vibe/shared/utils/logger";

import { EmailTemplate } from "../../../../config/email.template";
import { env } from "../../../../config/env";
import { getFullUser } from "../auth/me/route-handler/get-me";
import type {
  NotificationSendRequestType,
  NotificationSendRequestUrlParamsType,
  NotificationSendResponseOutputType,
} from "./schema";

export const renderNotificationEmail: EmailFunctionType<
  NotificationSendRequestType,
  NotificationSendResponseOutputType,
  NotificationSendRequestUrlParamsType
> = async ({ responseData, requestData, urlVariables, user }) => {
  const fullUser = await getFullUser(user.id);

  // Log data for debugging
  debugLogger("requestData", requestData);
  debugLogger("urlVariables", urlVariables);
  debugLogger("user", user);
  debugLogger("responseData", responseData);

  // Extract notification data
  const { channel, title, message, data } = requestData;

  return {
    success: true,
    data: {
      toEmail: fullUser.email,
      toName: fullUser.firstName,
      subject: `${title} - ${APP_NAME}`,

      jsx: (
        <EmailTemplate title={`${title} - ${APP_NAME}`} previewText={message}>
          <Text
            style={{
              fontSize: "16px",
              lineHeight: "1.6",
              color: "#374151",
              marginBottom: "16px",
            }}
          >
            {`Hello ${fullUser.firstName},`}
          </Text>

          <Text
            style={{
              fontSize: "16px",
              lineHeight: "1.6",
              color: "#374151",
              marginBottom: "16px",
            }}
          >
            {message}
          </Text>

          {data && (
            <Section style={{ marginBottom: "16px" }}>
              <Text
                style={{
                  fontSize: "16px",
                  lineHeight: "1.6",
                  color: "#374151",
                  marginBottom: "8px",
                }}
              >
                Additional Information:
              </Text>
              <div
                style={{
                  backgroundColor: "#f3f4f6",
                  padding: "12px",
                  borderRadius: "6px",
                  fontFamily: "monospace",
                }}
              >
                {JSON.stringify(data, null, 2)}
              </div>
            </Section>
          )}

          <Section style={{ textAlign: "center", marginTop: "32px" }}>
            <Button
              href={`${env.NEXT_PUBLIC_FRONTEND_APP_URL}/notifications/${channel}`}
              style={{
                backgroundColor: "#4f46e5",
                borderRadius: "6px",
                color: "#ffffff",
                fontSize: "16px",
                padding: "12px 24px",
                textDecoration: "none",
              }}
            >
              View in App
            </Button>
          </Section>
        </EmailTemplate>
      ),
    },
  };
};
