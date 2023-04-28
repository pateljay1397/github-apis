/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { BeWheelEvent, EventHandled, PrimitiveTool, Viewport } from "@itwin/core-frontend";
import { toaster } from "@itwin/itwinui-react";

/**
 * This is a simple dummy tool that overwrite the behaviour of the selection tool.
 */
export class NoSelectionTool extends PrimitiveTool {
  public static toolId = "NoSelection";

  public isCompatibleViewport(vp: Viewport | undefined, isSelectedViewChange: boolean): boolean { return (super.isCompatibleViewport(vp, isSelectedViewChange) && undefined !== vp); }
  public requireWriteableTarget(): boolean { return false; } // Tool doesn't modify the imodel.
  public async onRestartTool(): Promise<void> { return this.exitTool(); }

  /**
   * On click down, don't select anything. Instead, display a toast saying that the selection tool is disabled.
   */
  public async onDataButtonDown(_ev: BeWheelEvent): Promise<EventHandled> {
    toaster.setSettings({
      placement: "top",
      order: "descending",
    });
    toaster.informational("Selection tool is disabled. Please use the Element Picker at the bottom.", {
      duration: 3000,
      hasCloseButton: true,
      type: "temporary",
    });
    return EventHandled.Yes;
  }
}
