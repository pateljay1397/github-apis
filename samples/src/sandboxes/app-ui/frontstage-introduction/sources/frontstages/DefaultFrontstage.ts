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

export class DefaultContentGroupProvider extends ContentGroupProvider {
  public async provideContentGroup(_props: FrontstageProps): Promise<ContentGroup> {
    const iModel = UiFramework.getIModelConnection();
    let viewState;

    const defaultViewId = await iModel?.views?.queryDefaultViewId();
    if (defaultViewId && Id64.isValidId64(defaultViewId)) {
      viewState = await iModel?.views.load(defaultViewId);
      viewState && UiFramework.setDefaultViewState(viewState.clone());
    }

    return new ContentGroup({
      id: "sandbox:default",
      layout: StandardContentLayouts.singleView,
      contents: [
        {
          id: "sandbox:default-content",
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

export const DefaultFrontstageProps: StandardFrontstageProps = {
  id: "sandbox:default-frontstage",
  usage: StageUsage.General,
  contentGroupProps:new DefaultContentGroupProvider(),
};
