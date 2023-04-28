/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import {
  ContentGroup,
  ContentGroupProvider,
  FrontstageProps,
  IModelViewportControl,
  StandardFrontstageProps,
  ToolItemDef,
  UiFramework
} from "@itwin/appui-react";
import {
  StageUsage,
  StandardContentLayouts
} from "@itwin/appui-abstract";
import { Id64 } from "@itwin/core-bentley";
import { SimpleCustomTool } from "./SimpleCustomTool";
import { IModelApp } from "@itwin/core-frontend";

export class CustomWidgetsContentGroupProvider extends ContentGroupProvider {
  public async provideContentGroup(_props: FrontstageProps): Promise<ContentGroup> {
    const iModel = UiFramework.getIModelConnection();
    let viewState;
    const defaultViewId = await iModel?.views?.queryDefaultViewId();
    if (defaultViewId && Id64.isValidId64(defaultViewId)) {
      viewState = await iModel?.views.load(defaultViewId);
      viewState && UiFramework.setDefaultViewState(viewState.clone());
    }

    return new ContentGroup({
      id: "sandbox:custom-widgets",
      layout: StandardContentLayouts.singleView,
      contents: [
        {
          id: "sandbox:custom-widgets-content",
          classId: IModelViewportControl,
          applicationData: {
            viewState,
            iModelConnection: iModel,
          },
        },
      ],
    });
  }
}

export const CustomWidgetsFrontstageProps: StandardFrontstageProps = {
  id: "sandbox:custom-widgets-frontstage",
  usage: StageUsage.General,
  contentGroupProps:new CustomWidgetsContentGroupProvider(),
  hideNavigationAid: true,
  hideStatusBar: true,
  hideToolSettings: true,
  // Optionally, you can define a tool as the default one when the frontstage opens. If no tool is provided, the Selection Tool is used.
  defaultTool: new ToolItemDef({
    toolId: SimpleCustomTool.toolId,
    execute: async () => {
      void IModelApp.tools.run(SimpleCustomTool.toolId);
    },
  }),
};
