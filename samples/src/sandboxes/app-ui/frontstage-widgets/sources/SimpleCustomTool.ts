/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { BeWheelEvent, EventHandled, PrimitiveTool, Viewport } from "@itwin/core-frontend";
import { toaster } from "@itwin/itwinui-react";

/**
 * This is a simple tool that displays a toast message.
 */
export class SimpleCustomTool extends PrimitiveTool {
  public static toolId = "SimpleCustomTool";

  public isCompatibleViewport(vp: Viewport | undefined, isSelectedViewChange: boolean): boolean { return (super.isCompatibleViewport(vp, isSelectedViewChange) && undefined !== vp); }
  public requireWriteableTarget(): boolean { return false; } // Tool doesn't modify the imodel.
  public async onRestartTool(): Promise<void> { return this.exitTool(); }

  /**
   * On click down, don't select anything. Instead, display a toast.
   */
  public async onDataButtonDown(_ev: BeWheelEvent): Promise<EventHandled> {
    toaster.setSettings({
      placement: "top",
      order: "descending",
    });
    toaster.informational("Simple Custom Tool displays a message.", {
      duration: 3000,
      hasCloseButton: true,
      type: "temporary",
    });
    return EventHandled.Yes;
  }

  public async onResetButtonDown(_ev: BeWheelEvent): Promise<EventHandled> {
    void this.exitTool();
    return EventHandled.Yes;
  }
}
