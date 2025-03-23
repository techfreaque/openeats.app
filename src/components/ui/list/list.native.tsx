import { cn } from "next-query-portal/shared";
import type { ElementRef, ReactElement } from "react";
import { forwardRef } from "react";
import type { ViewProps } from "react-native";
import { View } from "react-native";

import type { ListItemProps, ListProps } from "./list.types";

export interface NativeListProps extends ViewProps, ListProps {}
export interface NativeListItemProps extends ViewProps, ListItemProps {}

export const List = forwardRef<ElementRef<typeof View>, NativeListProps>(
  ({ children, className, style, ordered, ...props }, ref): ReactElement => {
    return (
      <View
        ref={ref}
        className={cn("my-6 ml-6", className)}
        style={style}
        {...props}
      >
        {children}
      </View>
    );
  },
);

export const ListItem = forwardRef<
  ElementRef<typeof View>,
  NativeListItemProps
>(({ children, className, style, ...props }, ref): ReactElement => {
  return (
    <View ref={ref} className={cn("mt-2", className)} style={style} {...props}>
      {children}
    </View>
  );
});

List.displayName = "List";
ListItem.displayName = "ListItem";
