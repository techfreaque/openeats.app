import type { RouteType } from "next/dist/lib/load-custom-routes";
import type { LinkProps as _LinkProps } from "next/link";
import type { CSSProperties, ReactNode } from "react";

export interface LinkProps extends _LinkProps<RouteType> {
  children?: ReactNode;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}
