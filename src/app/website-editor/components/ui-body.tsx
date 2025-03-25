"use client";
import type { LegacyRef } from "react";
import { forwardRef, useEffect, useRef, useState } from "react";
import type {
  ImperativePanelGroupHandle,
  ImperativePanelHandle,
} from "react-resizable-panels";

import type { UiType } from "@/client-package/types/website-editor";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui";
import PreviewScreen from "./preview-screen";
const UIBody = forwardRef(
  (
    props: {
      isloading: boolean;
      code: string;
      uiType: UiType;
      captureRef: LegacyRef<HTMLDivElement>;
    },
    ref: LegacyRef<ImperativePanelGroupHandle>,
  ) => {
    const [layout, setLayout] = useState<number[] | null | undefined>();
    const panelRef = useRef<ImperativePanelHandle>(null);
    const layout3 = layout?.[2];
    useEffect(() => {
      const panel = panelRef?.current;
      if (!panel) {
        return;
      }
      if (!layout3) {
        return;
      }
      panel.resize(layout3);
    }, [layout3]);

    return (
      <div className="flex flex-1">
        <ResizablePanelGroup
          onLayout={setLayout}
          className="bg-white rounded-b-xl"
          ref={ref}
          direction="horizontal"
        >
          <ResizablePanel
            ref={panelRef}
            defaultSize={0}
            order={1}
          ></ResizablePanel>
          <ResizableHandle disabled={true} />
          <ResizablePanel
            minSize={26}
            defaultSize={100}
            className="bg-secondary relative"
            order={2}
          >
            {props.isloading && (
              <div className="absolute z-10 opacity-20 w-full h-[75vh] gradient-animation shadow-lg" />
            )}
            <div
              id="captureDiv"
              ref={props.captureRef}
              className={`max-h-[75vh] h-[75vh] ${props.isloading ? "overflow-y-hidden" : "overflow-y-auto"}`}
            >
              <PreviewScreen html_code={props.code} uiType={props.uiType} />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={0} order={3}></ResizablePanel>
        </ResizablePanelGroup>
      </div>
    );
  },
);

UIBody.displayName = "UIBody";

export default UIBody;
