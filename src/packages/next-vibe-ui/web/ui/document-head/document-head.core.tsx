// import { DocumentHead as NativeDocumentHead } from "./document-head.native";
import { DocumentHead as WebDocumentHead } from "./document-head.web";

export type { DocumentHeadProps } from "./document-head.types";

export const DocumentHead =
  // envClient.platform.isReactNative
  // ? NativeDocumentHead
  //   :
  WebDocumentHead;
