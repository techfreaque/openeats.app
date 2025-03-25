"use client";
import React from "react";

import { ClientThemeCustomizer } from "./client-page";

export default async function ThemeCustomizer({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.JSX.Element> {
  const { id } = await params;
  return <ClientThemeCustomizer id={id} />;
}
