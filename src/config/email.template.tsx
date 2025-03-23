import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Section,
  Text,
} from "@react-email/components";
import { APP_NAME } from "next-query-portal/shared";
import type { JSX, ReactNode } from "react";

import { env } from "./env";

type EmailTemplateProps = {
  title: string;
  previewText?: string;
  children: ReactNode;
};

export function EmailTemplate({
  title,
  previewText,
  children,
}: EmailTemplateProps): JSX.Element {
  return (
    <Html lang="en">
      <Head>{previewText && <Text>{previewText}</Text>}</Head>
      <Body
        style={{
          backgroundColor: "#f6f9fc",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          margin: "0",
        }}
      >
        <Container
          style={{ padding: "40px 20px", width: "100%", maxWidth: "600px" }}
        >
          <Section
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              padding: "24px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
            }}
          >
            {/* Header with title */}
            <Text
              style={{
                fontSize: "24px",
                fontWeight: "700",
                textAlign: "center",
                color: "#111827",
                margin: "0 0 24px",
              }}
            >
              {title}
            </Text>

            {/* Main content */}
            {children}

            {/* Divider before footer */}
            <Hr style={{ borderColor: "#e5e7eb", margin: "24px 0" }} />

            {/* Footer */}
            <Text
              style={{
                fontSize: "14px",
                color: "#6b7280",
                textAlign: "center",
              }}
            >
              © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
            </Text>
            <Text
              style={{
                fontSize: "14px",
                color: "#6b7280",
                textAlign: "center",
                marginTop: "8px",
              }}
            >
              Need help? Contact us at{" "}
              <Link
                href={`mailto:${env.SUPPORT_EMAIL}`}
                style={{ color: "#4f46e5" }}
              >
                {env.SUPPORT_EMAIL}
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
