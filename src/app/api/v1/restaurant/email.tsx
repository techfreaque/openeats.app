import { Button, Section, Text } from "@react-email/components";
import type { EmailFunctionType } from "next-vibe/server/email/handle-emails";
import { APP_NAME } from "next-vibe/shared/constants";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";
import { debugLogger } from "next-vibe/shared/utils/logger";

import { EmailTemplate } from "@/config/email.template";
import { env } from "@/config/env";

import { getFullUser } from "../auth/me/route-handler/get-me";
import type {
  RestaurantCreateType,
  RestaurantResponseType,
} from "./schema/restaurant.schema";

export const renderRestaurantCreatedMail: EmailFunctionType<
  RestaurantCreateType,
  RestaurantResponseType,
  UndefinedType
> = async ({ responseData, requestData, urlVariables, user }) => {
  const fullUser = await getFullUser(user.id);
  // you can get validated data from the request body
  debugLogger("requestData", requestData);
  // you can get validated data from the URL
  debugLogger("urlVariables", urlVariables);
  // you can get the user object if the user is authenticated
  debugLogger("user", user);
  // you can get the validated response data from the handler
  debugLogger("responseData", responseData);
  // you can return an error if you want to stop the email from being sent
  // return { success: false, message: "An error occurred", errorCode: 500 };
  return {
    success: true,
    data: {
      toEmail: fullUser.email,
      toName: fullUser.firstName,
      subject: `Template Subject ${APP_NAME}!`,

      jsx: (
        <EmailTemplate
          title={`Template title ${APP_NAME}, ${fullUser.firstName}!`}
          previewText={`Template preview message!`}
        >
          <Text
            style={{
              fontSize: "16px",
              lineHeight: "1.6",
              color: "#374151",
              marginBottom: "16px",
            }}
          >
            We&apos;re excited to have you on board. You can now start using
            your account to access all the features of {APP_NAME}.
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
            <li style={{ margin: "8px 0" }}>
              Manage your orders and deliveries
            </li>
            <li style={{ margin: "8px 0" }}>Track performance metrics</li>
            <li style={{ margin: "8px 0" }}>Access custom reports</li>
          </ul>

          <Section style={{ textAlign: "center", marginTop: "32px" }}>
            <Button
              href={env.NEXT_PUBLIC_FRONTEND_APP_URL}
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
    },
  };
};

export const renderRestaurantUpdatedMail: EmailFunctionType<
  RestaurantCreateType,
  RestaurantResponseType,
  UndefinedType
> = async ({ responseData, requestData, urlVariables, user }) => {
  const fullUser = await getFullUser(user.id);
  // you can get validated data from the request body
  debugLogger("requestData", requestData);
  // you can get validated data from the URL
  debugLogger("urlVariables", urlVariables);
  // you can get the user object if the user is authenticated
  debugLogger("user", user);
  // you can get the validated response data from the handler
  debugLogger("responseData", responseData);
  // you can return an error if you want to stop the email from being sent
  // return { success: false, message: "An error occurred", errorCode: 500 };
  return {
    success: true,
    data: {
      toEmail: fullUser.email,
      toName: fullUser.firstName,
      subject: `Template Subject ${APP_NAME}!`,

      jsx: (
        <EmailTemplate
          title={`Template title ${APP_NAME}, ${fullUser.firstName}!`}
          previewText={`Template preview message!`}
        >
          <Text
            style={{
              fontSize: "16px",
              lineHeight: "1.6",
              color: "#374151",
              marginBottom: "16px",
            }}
          >
            We&apos;re excited to have you on board. You can now start using
            your account to access all the features of {APP_NAME}.
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
            <li style={{ margin: "8px 0" }}>
              Manage your orders and deliveries
            </li>
            <li style={{ margin: "8px 0" }}>Track performance metrics</li>
            <li style={{ margin: "8px 0" }}>Access custom reports</li>
          </ul>

          <Section style={{ textAlign: "center", marginTop: "32px" }}>
            <Button
              href={env.NEXT_PUBLIC_FRONTEND_APP_URL}
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
    },
  };
};
