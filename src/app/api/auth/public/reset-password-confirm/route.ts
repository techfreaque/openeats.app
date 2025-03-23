import "server-only";

import { apiHandler } from "next-query-portal/server";

import { errorLogger } from "../../../../../package/shared";
import { db } from "../../../db";
import { hashPassword } from "../register/route";
import { verifyPasswordResetToken } from "../reset-password/utils";
import { resetPasswordConfirmEndpoint } from "./definition";
import { renderResetPasswordConfirmMail } from "./email";

export const POST = apiHandler({
  endpoint: resetPasswordConfirmEndpoint,
  email: {
    afterHandlerEmails: [
      {
        render: renderResetPasswordConfirmMail,
      },
    ],
  },
  handler: async ({ data }) => {
    const resetPayload = await verifyPasswordResetToken(data.token);
    if (!resetPayload || !resetPayload.email || !resetPayload.userId) {
      return {
        success: false,
        message: "Invalid or expired token",
        errorCode: 400,
      };
    }
    const user = await db.user.findUnique({
      where: { email: resetPayload.email, id: resetPayload.userId },
    });
    if (!user) {
      errorLogger("User not found in password reset confirm");
      return {
        success: false,
        message: "User not found or the link was already used",
        errorCode: 404,
      };
    }
    const hashedPassword = await hashPassword(data.confirmPassword);
    await db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
    return { success: true, data: "Password reset successful" };
  },
});
