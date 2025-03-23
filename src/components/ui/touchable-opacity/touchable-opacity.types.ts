import { type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import type { touchableVariants } from "./touchable-opacity.core";

export interface BaseTouchableOpacityProps {
  children?: ReactNode;
  className?: string;
  style?: Record<string, string | number>;
  onPress?: () => void;
  disabled?: boolean;
  activeOpacity?: number;
}

export interface TouchableOpacityProps
  extends BaseTouchableOpacityProps,
    VariantProps<typeof touchableVariants> {}
