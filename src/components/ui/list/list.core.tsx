import { cva, type VariantProps } from "class-variance-authority";

// import { List as NativeList, ListItem as NativeListItem } from "./list.native";
import { List as WebList, ListItem as WebListItem } from "./list.web";

export type { ListItemProps, ListProps } from "./list.types";

export const listVariants = cva("my-6 ml-6", {
  variants: {
    variant: {
      disc: "",
      decimal: "",
      none: "",
    },
  },
  defaultVariants: {
    variant: "disc",
  },
});

export const listItemVariants = cva("mt-2", {});

export type ListVariantProps = VariantProps<typeof listVariants>;
export type ListItemVariantProps = VariantProps<typeof listItemVariants>;

export const List =
  // envClient.platform.isReactNative ? NativeList :
  WebList;
export const ListItem =
  // envClient.platform.isReactNative
  // ? NativeListItem
  // :
  WebListItem;
