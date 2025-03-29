import { type VariantProps } from "class-variance-authority";
import type { CSSProperties, ReactNode } from "react";

import type { touchableVariants } from "./touchable-opacity.core";

export interface BaseTouchableOpacityProps {
  children?: ReactNode;
  className?: string | undefined;
  style?: CSSProperties | undefined;
  onPress?: () => void;
  disabled?: boolean | undefined;
  activeOpacity?: number;
}

export interface TouchableOpacityProps
  extends BaseTouchableOpacityProps,
    VariantProps<typeof touchableVariants> {}
