// import { FlatList as NativeFlatList } from "./flat-list.native";
import { FlatList as WebFlatList } from "./flat-list.web";

export type { FlatListProps } from "./flat-list.types";

export const FlatList =
  // envClient.platform.isReactNative
  // ? NativeFlatList
  //   :
  WebFlatList;
