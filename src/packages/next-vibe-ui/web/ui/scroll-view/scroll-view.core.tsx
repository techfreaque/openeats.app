import { cva, type VariantProps } from "class-variance-authority";

// import { ScrollView as NativeScrollView } from "./scroll-view.native";
import { ScrollView as WebScrollView } from "./scroll-view.web";

export type { ScrollViewProps } from "./scroll-view.types";

export const scrollViewVariants = cva("", {
  variants: {
    direction: {
      vertical: "flex-col",
      horizontal: "flex-row",
    },
    padding: {
      none: "",
      sm: "p-2",
      md: "p-4",
      lg: "p-6",
    },
  },
  defaultVariants: {
    direction: "vertical",
    padding: "none",
  },
});

export type ScrollViewVariantProps = VariantProps<typeof scrollViewVariants>;

export const ScrollView =
  // envClient.platform.isReactNative
  // ? NativeScrollView
  //   :
  WebScrollView;
