import { cn } from "next-query-portal/shared/utils/utils";
import type { HTMLAttributes, ReactElement } from "react";
import { forwardRef } from "react";

import { scrollViewVariants } from "./scroll-view.core";
import type { BaseScrollViewProps } from "./scroll-view.types";

export interface WebScrollViewProps
  extends HTMLAttributes<HTMLDivElement>,
    BaseScrollViewProps {
  direction?: "vertical" | "horizontal";
  padding?: "none" | "sm" | "md" | "lg";
}

export const ScrollView = forwardRef<HTMLDivElement, WebScrollViewProps>(
  (
    {
      children,
      className,
      style,
      horizontal,
      showsHorizontalScrollIndicator = true,
      showsVerticalScrollIndicator = true,
      direction,
      padding,
      ...props
    },
    ref,
  ): ReactElement => {
    // If horizontal is specified, override direction
    const actualDirection = horizontal ? "horizontal" : direction;

    return (
      <div
        ref={ref}
        className={cn(
          "overflow-auto",
          scrollViewVariants({
            direction: actualDirection,
            padding,
            className,
          }),
          {
            "overflow-x-auto": actualDirection === "horizontal",
            "overflow-y-auto": actualDirection !== "horizontal",
            "scrollbar-hide":
              (actualDirection === "horizontal" &&
                !showsHorizontalScrollIndicator) ||
              (actualDirection !== "horizontal" &&
                !showsVerticalScrollIndicator),
          },
        )}
        style={style}
        {...props}
      >
        {children}
      </div>
    );
  },
);

ScrollView.displayName = "ScrollView";
