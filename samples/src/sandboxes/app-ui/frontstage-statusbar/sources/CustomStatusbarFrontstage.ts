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
  UiFramework
} from "@itwin/appui-react";
import {
  StageUsage,
  StandardContentLayouts
} from "@itwin/appui-abstract";
import { Id64 } from "@itwin/core-bentley";

export class CustomStatusbarContentGroupProvider extends ContentGroupProvider {
  public async provideContentGroup(_props: FrontstageProps): Promise<ContentGroup> {
    const iModel = UiFramework.getIModelConnection();
    let viewState;
    const defaultViewId = await iModel?.views?.queryDefaultViewId();
    if (defaultViewId && Id64.isValidId64(defaultViewId)) {
      viewState = await iModel?.views.load(defaultViewId);
      viewState && UiFramework.setDefaultViewState(viewState.clone());
    }

    return new ContentGroup({
      id: "sandbox:custom-status-bar",
      layout: StandardContentLayouts.singleView,
      contents: [
        {
          id: "sandbox:custom-status-bar-content",
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

export const CustomStatusbarFrontstageProps: StandardFrontstageProps = {
  id: "sandbox:custom-status-bar-frontstage",
  usage: StageUsage.General,
  contentGroupProps:new CustomStatusbarContentGroupProvider(),
  hideNavigationAid: false,
  // Having the hideStatusBar flag set to true will cause the provideStatusBarItems function not to run for this frontstage.
  // Effectively, this means no status bar will be provided for the frontstage even if you try to define one.
  hideStatusBar: false,
  hideToolSettings: true,
};
