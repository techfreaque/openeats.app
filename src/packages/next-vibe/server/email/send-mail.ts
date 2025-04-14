import "server-only";

import { render } from "@react-email/render";
import { createTransport } from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import type { JSX } from "react";

import type { ResponseType } from "../../shared/types/response.schema";
import { ErrorResponseTypes } from "../../shared/types/response.schema";
import { env } from "../env";

/**
 * SendEmailParams defines the parameters needed to send an email,
 * including the rendered JSX and typical email metadata.
 */
export interface SendEmailParams {
  jsx: JSX.Element;
  subject: string;
  fromName: string;
  fromEmail: string;
  toName: string;
  toEmail: string;
  replyToName?: string;
  replyToEmail?: string;
}

/**
 * Sends an email via Nodemailer, inlining Tailwind classes along the way.
 */
export async function sendEmail({
  jsx,
  subject,
  fromName,
  fromEmail,
  toEmail,
  toName,
  replyToEmail,
  replyToName,
}: SendEmailParams): Promise<ResponseType<SMTPTransport.SentMessageInfo>> {
  // 1) Render the React component to raw HTML
  const rawHtml: string = await render(jsx);

  // // 2) Transform Tailwind classes into inline styles
  // const finalHtml: string = mailwind(rawHtml);

  // 3) Create a Nodemailer transport
  //    Replace with your real SMTP credentials
  const transporter = createTransport({
    host: env.EMAIL_HOST, // e.g. smtp.sendgrid.net
    port: env.EMAIL_PORT, // or 465 for SSL
    secure: env.EMAIL_SECURE, // true for 465
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
  });

  // 4) Prepare and send the email
  const response = await transporter.sendMail({
    from: `${fromName} <${fromEmail}>`,
    to: `${toName} <${toEmail}>`,
    replyTo: `${replyToName} <${replyToEmail}>`,
    subject,
    html: rawHtml,
  });
  if (response.accepted.length === 0) {
    return {
      success: false,
      errorType: ErrorResponseTypes.EMAIL_ERROR,
      message: "Failed to send email",
    };
  }
  return {
    success: true,
    data: response,
  };
}
