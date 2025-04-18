import { Button, Section, Text } from "@react-email/components";
import type { EmailFunctionType } from "next-vibe/server/email/handle-emails";
import { APP_NAME } from "next-vibe/shared/constants";
import { debugLogger } from "next-vibe/shared/utils/logger";

import { EmailTemplate } from "../../../../config/email.template";
import { env } from "../../../../config/env";
import { getFullUser } from "../auth/me/route-handler/get-me";
import type { CartItemResponseType } from "./definition";

/**
 * Email rendering function for cart operations
 * This is used to send emails when cart operations are performed
 */
export const renderCartEmail: EmailFunctionType<
  unknown,
  CartItemResponseType,
  unknown
> = async ({ responseData, requestData, urlVariables, user }) => {
  try {
    const fullUser = await getFullUser(user.id);

    // Log data for debugging
    debugLogger("Cart email request data:", requestData);
    debugLogger("Cart email URL variables:", urlVariables);
    debugLogger("Cart email user:", user);
    debugLogger("Cart email response data:", responseData);

    return {
      success: true,
      data: {
        toEmail: fullUser.email,
        toName: fullUser.firstName,
        subject: `Cart Updated - ${APP_NAME}`,

        jsx: (
          <EmailTemplate
            title={`Your cart has been updated - ${APP_NAME}`}
            previewText="Your shopping cart has been updated"
          >
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
              {`Your shopping cart has been updated. You can review your cart and complete your order by clicking the button below.`}
            </Text>

            <Section style={{ textAlign: "center", marginTop: "32px" }}>
              <Button
                href={`${env.NEXT_PUBLIC_FRONTEND_APP_URL}/cart`}
                style={{
                  backgroundColor: "#4f46e5",
                  borderRadius: "6px",
                  color: "#ffffff",
                  fontSize: "16px",
                  padding: "12px 24px",
                  textDecoration: "none",
                }}
              >
                View Your Cart
              </Button>
            </Section>
          </EmailTemplate>
        ),
      },
    };
  } catch (error) {
    debugLogger("Error rendering cart email:", error);
    return {
      success: false,
      message: "Failed to render cart email",
      errorCode: 500,
    };
  }
};
