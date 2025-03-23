import type { JSX } from "react";

import { getEndpoints } from "../../package/server";
import { ApiExplorer } from "./components/api-explorer";

export default function Page(): JSX.Element {
  const endpoints = getEndpoints();
  return <ApiExplorer endpoints={endpoints} />;
}
