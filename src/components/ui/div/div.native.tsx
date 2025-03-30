import { cn } from "next-vibe/shared/utils/utils";
import type { ElementRef, ReactElement } from "react";
import { forwardRef } from "react";
import type { ViewProps } from "react-native";
import { TouchableOpacity, View } from "react-native";

import { divVariants } from "./div.core";
import type { BaseDivProps } from "./div.types";

export interface NativeDivProps extends ViewProps, BaseDivProps {
  variant?: "default" | "card" | "transparent";
  padding?: "none" | "sm" | "md" | "lg";
  rounded?: "none" | "sm" | "md" | "lg" | "full";
  border?: "none" | "default";
}

export const Div = forwardRef<ElementRef<typeof View>, NativeDivProps>(
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
    // If we have an onClick handler, wrap the View in a TouchableOpacity
    if (onClick) {
      return (
        <TouchableOpacity onPress={onClick}>
          <View
            ref={ref}
            className={cn(
              divVariants({ variant, padding, rounded, border, className }),
            )}
            style={style}
            {...props}
          >
            {children}
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <View
        ref={ref}
        className={cn(
          divVariants({ variant, padding, rounded, border, className }),
        )}
        style={style}
        {...props}
      >
        {children}
      </View>
    );
  },
);

Div.displayName = "Div";
