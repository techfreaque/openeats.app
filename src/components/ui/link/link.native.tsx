import { Link as ExpoLink } from "expo-router";
import type { JSX } from "react";

import type { LinkProps } from "./link.types";

export function Link({
  href,
  children,
  style,
  className,
}: LinkProps): JSX.Element {
  return (
    <ExpoLink href={href} style={style} className={className}>
      {children}
    </ExpoLink>
  );
}

Link.displayName = "Link";
