import "server-only";

import { apiHandler } from "next-query-portal/server";

import { resetPasswordConfirmEndpoint } from "./definition";

export const POST = apiHandler({
  endpoint: resetPasswordConfirmEndpoint,
  handler: confirmPasswordReset,
});

export type ResetPasswordConfirmEmailTemplateVariables = EmailTemplateVariables;

export async function confirmPasswordReset({
  data,
}: ApiHandlerCallBackProps<ResetPasswordConfirmType, UndefinedType>): Promise<
  SafeReturnType<MessageResponseType>
> {
  const resetPayload = await verifyPasswordResetToken(data.token);
  if (!resetPayload || !resetPayload.email || !resetPayload.userId) {
    return {
      success: false,
      message: "Invalid or expired token",
      errorCode: 400,
    };
  }
  const user = await prisma.user.findUnique({
    where: { email: resetPayload.email, id: resetPayload.userId },
  });
  if (!user) {
    errorLogger("User not found in password reset confirm");
    return { success: false, message: "User not found", errorCode: 404 };
  }
  const hashedPassword = await hashPassword(data.confirmPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  const emailService = new EmailService();
  const response: SMTPTransport.SentMessageInfo | null =
    await emailService.sendTemplateEmail<ResetPasswordConfirmEmailTemplateVariables>(
      {
        to: user.email,
        subject: "Password reset successful",
        templateName: "reset-password-confirm-mail",
        templateData: {
          title: "Password reset successful",
          message:
            "Your password has been successfully reset. If you did not request this change, please contact us immediately.",
          name: user.firstName,
          APP_NAME: APP_NAME,
        },
      },
    );
  if (!response || response.accepted.length === 0) {
    errorLogger(
      "Failed to send email in password reset confirm to user:",
      response,
    );
    return {
      success: true,
      data: "Password successfully reset, but failed to send email",
    };
  }
  return {
    success: true,
    data: "Password successfully reset",
  };
}
