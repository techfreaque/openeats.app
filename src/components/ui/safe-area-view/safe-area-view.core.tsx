// import { SafeAreaView as NativeSafeAreaView } from "./safe-area-view.native";
import { SafeAreaView as WebSafeAreaView } from "./safe-area-view.web";

export type { SafeAreaViewProps } from "./safe-area-view.types";

export const SafeAreaView =
  // envClient.platform.isReactNative
  // ? NativeSafeAreaView
  //   :
  WebSafeAreaView;
