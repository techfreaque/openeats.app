import NextLink from "next/link";
import type { JSX } from "react";

import type { LinkProps } from "./link.types";

export function Link({
  href,
  children,
  className,
  style,
}: LinkProps): JSX.Element {
  return (
    <NextLink href={href} className={className} style={style}>
      {children}
    </NextLink>
  );
}
Link.displayName = "Link";
