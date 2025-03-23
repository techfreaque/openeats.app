import "./globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { APP_NAME } from "next-query-portal/shared";
import type React from "react";
import type { JSX } from "react";

import { Layout } from "../components/layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${APP_NAME} Partner Portal`,
  description: "Partner portal for restaurants, drivers, and administrators",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
