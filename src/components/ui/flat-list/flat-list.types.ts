import type { CSSProperties, ReactElement } from "react";

export interface FlatListProps<T> {
  data: T[];
  renderItem: ({ item, index }: { item: T; index: number }) => ReactElement;
  keyExtractor?: (item: T, index: number) => string;
  horizontal?: boolean;
  numColumns?: number;
  className?: string | undefined;
  style?: CSSProperties | undefined;
  showsHorizontalScrollIndicator?: boolean;
  showsVerticalScrollIndicator?: boolean;
  contentContainerStyle?: Record<string, string | number>;
}
