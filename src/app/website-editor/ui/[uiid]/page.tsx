import type { JSX } from "react";

import { ClientUI } from "./client-page";

export default async function UI({
  params,
}: {
  params: Promise<{ uiid: string }>;
}): Promise<JSX.Element> {
  const { uiid } = await params;
  return <ClientUI uiid={uiid} />;
}
