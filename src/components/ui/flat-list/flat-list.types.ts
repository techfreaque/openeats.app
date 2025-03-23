import type { ReactElement } from "react";

export interface FlatListProps<T> {
  data: T[];
  renderItem: ({ item, index }: { item: T; index: number }) => ReactElement;
  keyExtractor?: (item: T, index: number) => string;
  horizontal?: boolean;
  numColumns?: number;
  className?: string;
  style?: Record<string, string | number>;
  showsHorizontalScrollIndicator?: boolean;
  showsVerticalScrollIndicator?: boolean;
  contentContainerStyle?: Record<string, string | number>;
}
