import type { Metadata } from "next";
import { APP_NAME } from "next-vibe/shared/constants";
import type React from "react";
import type { JSX } from "react";

import { Layout } from "@/components/layout";

export const metadata: Metadata = {
  title: `${APP_NAME} Partner Portal`,
  description: "Partner portal for restaurants, drivers, and administrators",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element {
  return <Layout>{children}</Layout>;
}
