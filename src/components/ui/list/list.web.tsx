import { cn } from "next-query-portal/shared/utils/utils";
import type { HTMLAttributes, ReactElement } from "react";
import { forwardRef } from "react";

import type { ListItemProps, ListProps } from "./list.types";

export interface WebListProps
  extends HTMLAttributes<HTMLUListElement | HTMLOListElement>,
    ListProps {}
export interface WebListItemProps
  extends HTMLAttributes<HTMLLIElement>,
    ListItemProps {}

export const List = forwardRef<
  HTMLUListElement | HTMLOListElement,
  WebListProps
>(({ children, className, style, ordered, ...props }, ref): ReactElement => {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag
      ref={ref}
      className={cn(
        "my-6 ml-6",
        { "list-disc": !ordered, "list-decimal": ordered },
        className,
      )}
      style={style}
      {...props}
    >
      {children}
    </Tag>
  );
});

export const ListItem = forwardRef<HTMLLIElement, WebListItemProps>(
  ({ children, className, style, ...props }, ref): ReactElement => {
    return (
      <li ref={ref} className={cn("mt-2", className)} style={style} {...props}>
        {children}
      </li>
    );
  },
);

List.displayName = "List";
ListItem.displayName = "ListItem";
