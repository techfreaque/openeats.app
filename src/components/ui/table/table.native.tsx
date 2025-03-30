import { cn } from "next-vibe/shared/utils/utils";
import type { ElementRef } from "react";
import { forwardRef } from "react";
import type { ViewProps } from "react-native";
import { ScrollView, View } from "react-native";

import type {
  TableBodyProps,
  TableCellProps,
  TableHeaderProps,
  TableHeadProps,
  TableProps,
  TableRowProps,
} from "./table.types";

// Basic table structure for React Native
// Note: This is a simplified implementation as complex tables in RN require specialized libraries

export const Table = forwardRef<
  ElementRef<typeof ScrollView>,
  ViewProps & TableProps
>(({ className, style, children, ...props }, ref) => (
  <ScrollView
    horizontal
    ref={ref}
    className={cn("my-6 w-full", className)}
    style={style}
    {...props}
  >
    <View className="w-full">{children}</View>
  </ScrollView>
));
Table.displayName = "Table";

export const TableHeader = forwardRef<
  ElementRef<typeof View>,
  ViewProps & TableHeaderProps
>(({ className, style, ...props }, ref) => (
  <View ref={ref} className={cn(className)} style={style} {...props} />
));
TableHeader.displayName = "TableHeader";

export const TableBody = forwardRef<
  ElementRef<typeof View>,
  ViewProps & TableBodyProps
>(({ className, style, ...props }, ref) => (
  <View ref={ref} className={cn(className)} style={style} {...props} />
));
TableBody.displayName = "TableBody";

export const TableRow = forwardRef<
  ElementRef<typeof View>,
  ViewProps & TableRowProps
>(({ className, style, ...props }, ref) => (
  <View
    ref={ref}
    className={cn("flex-row m-0 border-t p-0 even:bg-muted", className)}
    style={style}
    {...props}
  />
));
TableRow.displayName = "TableRow";

export const TableHead = forwardRef<
  ElementRef<typeof View>,
  ViewProps & TableHeadProps
>(({ className, style, ...props }, ref) => (
  <View
    ref={ref}
    className={cn("border px-4 py-2 flex-1 font-bold", className)}
    style={style}
    {...props}
  />
));
TableHead.displayName = "TableHead";

export const TableCell = forwardRef<
  ElementRef<typeof View>,
  ViewProps & TableCellProps
>(({ className, style, ...props }, ref) => (
  <View
    ref={ref}
    className={cn("border px-4 py-2 flex-1", className)}
    style={style}
    {...props}
  />
));
TableCell.displayName = "TableCell";
