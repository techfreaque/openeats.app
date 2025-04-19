import Head from "next/head";
import type { ReactElement } from "react";

import type { DocumentHeadProps } from "./document-head.types";

export function DocumentHead({
  title,
  description,
}: DocumentHeadProps): ReactElement {
  return (
    <Head>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
    </Head>
  );
}

DocumentHead.displayName = "DocumentHead";
