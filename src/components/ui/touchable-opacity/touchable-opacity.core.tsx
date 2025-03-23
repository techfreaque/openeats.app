import { cva, type VariantProps } from "class-variance-authority";

// import { TouchableOpacity as NativeTouchableOpacity } from "./touchable-opacity.native";
import { TouchableOpacity as WebTouchableOpacity } from "./touchable-opacity.web";

export type { TouchableOpacityProps } from "./touchable-opacity.types";

export const touchableVariants = cva("", {
  variants: {
    variant: {
      default: "",
      subtle: "hover:bg-muted/50",
      ghost: "hover:bg-muted",
    },
    padding: {
      none: "",
      sm: "p-1",
      md: "p-2",
      lg: "p-3",
    },
    rounded: {
      none: "",
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-lg",
      full: "rounded-full",
    },
  },
  defaultVariants: {
    variant: "default",
    padding: "none",
    rounded: "none",
  },
});

export type TouchableVariantProps = VariantProps<typeof touchableVariants>;

export const TouchableOpacity =
  // envClient.platform.isReactNative
  // ? NativeTouchableOpacity
  //   :
  WebTouchableOpacity;
