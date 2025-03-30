import { cn } from "next-vibe/shared/utils/utils";
import type { ElementRef, ReactElement } from "react";
import { forwardRef } from "react";
import {
  TouchableOpacity as RNTouchableOpacity,
  type TouchableOpacityProps as RNTouchableOpacityProps,
} from "react-native";

import { touchableVariants } from "./touchable-opacity.core";
import type { BaseTouchableOpacityProps } from "./touchable-opacity.types";

export interface NativeTouchableOpacityProps
  extends RNTouchableOpacityProps,
    BaseTouchableOpacityProps {
  variant?: "default" | "subtle" | "ghost";
  padding?: "none" | "sm" | "md" | "lg";
  rounded?: "none" | "sm" | "md" | "lg" | "full";
}

export const TouchableOpacity = forwardRef<
  ElementRef<typeof RNTouchableOpacity>,
  NativeTouchableOpacityProps
>(
  (
    {
      children,
      className,
      style,
      onPress,
      disabled,
      activeOpacity,
      variant,
      padding,
      rounded,
      ...props
    },
    ref,
  ): ReactElement => {
    return (
      <RNTouchableOpacity
        ref={ref}
        className={cn(
          touchableVariants({ variant, padding, rounded, className }),
        )}
        style={style}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={activeOpacity}
        {...props}
      >
        {children}
      </RNTouchableOpacity>
    );
  },
);

TouchableOpacity.displayName = "TouchableOpacity";
