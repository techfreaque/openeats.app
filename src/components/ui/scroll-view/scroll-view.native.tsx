import { cn } from "next-query-portal/shared";
import type { ElementRef, ReactElement } from "react";
import { forwardRef } from "react";
import {
  ScrollView as RNScrollView,
  type ScrollViewProps as RNScrollViewProps,
} from "react-native";

import { scrollViewVariants } from "./scroll-view.core";
import type { BaseScrollViewProps } from "./scroll-view.types";

export interface NativeScrollViewProps
  extends RNScrollViewProps,
    BaseScrollViewProps {
  direction?: "vertical" | "horizontal";
  padding?: "none" | "sm" | "md" | "lg";
}

export const ScrollView = forwardRef<
  ElementRef<typeof RNScrollView>,
  NativeScrollViewProps
>(
  (
    {
      children,
      className,
      style,
      horizontal,
      showsHorizontalScrollIndicator,
      showsVerticalScrollIndicator,
      direction,
      padding,
      ...props
    },
    ref,
  ): ReactElement => {
    // If horizontal is specified, override direction
    const actualDirection = horizontal ? "horizontal" : direction;
    const isHorizontal = actualDirection === "horizontal";

    return (
      <RNScrollView
        ref={ref}
        horizontal={isHorizontal}
        showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        className={cn(
          scrollViewVariants({
            direction: actualDirection,
            padding,
            className,
          }),
        )}
        style={style}
        {...props}
      >
        {children}
      </RNScrollView>
    );
  },
);

ScrollView.displayName = "ScrollView";
