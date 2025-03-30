import { cn } from "next-vibe/shared/utils/utils";
import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { forwardRef } from "react";

import type {
  TableBodyProps,
  TableCellProps,
  TableHeaderProps,
  TableHeadProps,
  TableProps,
  TableRowProps,
} from "./table.types";

export const Table = forwardRef<
  HTMLTableElement,
  HTMLAttributes<HTMLTableElement> & TableProps
>(({ className, ...props }, ref) => (
  <div className="my-6 w-full overflow-y-auto">
    <table ref={ref} className={cn("w-full", className)} {...props} />
  </div>
));
Table.displayName = "Table";

export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement> & TableHeaderProps
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn(className)} {...props} />
));
TableHeader.displayName = "TableHeader";

export const TableBody = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement> & TableBodyProps
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn(className)} {...props} />
));
TableBody.displayName = "TableBody";

export const TableRow = forwardRef<
  HTMLTableRowElement,
  HTMLAttributes<HTMLTableRowElement> & TableRowProps
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn("m-0 border-t p-0 even:bg-muted", className)}
    {...props}
  />
));
TableRow.displayName = "TableRow";

export const TableHead = forwardRef<
  HTMLTableCellElement,
  ThHTMLAttributes<HTMLTableCellElement> & TableHeadProps
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right",
      className,
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

export const TableCell = forwardRef<
  HTMLTableCellElement,
  TdHTMLAttributes<HTMLTableCellElement> & TableCellProps
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right",
      className,
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";
