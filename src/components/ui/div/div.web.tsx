import { cn } from "next-query-portal/shared/utils/utils";
import type { HTMLAttributes, ReactElement } from "react";
import { forwardRef } from "react";

import { divVariants } from "./div.core";
import type { BaseDivProps } from "./div.types";

export interface WebDivProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onClick">,
    BaseDivProps {
  variant?: "default" | "card" | "transparent";
  padding?: "none" | "sm" | "md" | "lg";
  rounded?: "none" | "sm" | "md" | "lg" | "full";
  border?: "none" | "default";
}

export const Div = forwardRef<HTMLDivElement, WebDivProps>(
  (
    {
      children,
      className,
      style,
      onClick,
      variant,
      padding,
      rounded,
      border,
      ...props
    },
    ref,
  ): ReactElement => {
    return (
      <div
        ref={ref}
        className={cn(
          divVariants({ variant, padding, rounded, border, className }),
        )}
        style={style}
        onClick={onClick}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Div.displayName = "Div";
