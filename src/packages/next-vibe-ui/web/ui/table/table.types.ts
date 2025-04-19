import type { CSSProperties, ReactNode } from "react";

export interface TableProps {
  children?: ReactNode;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

export interface TableHeaderProps {
  children?: ReactNode;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

export interface TableBodyProps {
  children?: ReactNode;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

export interface TableRowProps {
  children?: ReactNode;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

export interface TableHeadProps {
  children?: ReactNode;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

export interface TableCellProps {
  children?: ReactNode;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}
