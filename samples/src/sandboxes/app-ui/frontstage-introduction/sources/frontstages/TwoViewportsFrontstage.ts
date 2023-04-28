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
import { StandardViewId } from "@itwin/core-frontend";

export class TwoViewportsContentGroupProvider extends ContentGroupProvider {
  public async provideContentGroup(_props: FrontstageProps): Promise<ContentGroup> {
    const iModel = UiFramework.getIModelConnection();
    let viewState;
    const defaultViewId = await iModel?.views?.queryDefaultViewId();
    if (defaultViewId && Id64.isValidId64(defaultViewId)) {
      viewState = await iModel?.views.load(defaultViewId);
      viewState && UiFramework.setDefaultViewState(viewState.clone());
    }

    // Create a clone of the viewState so we can manipulate it
    const viewStateClone = viewState?.clone(iModel);
    /**
     * See StandardViewId (https://www.itwinjs.org/reference/core-frontend/views/standardviewid/)
     * and StandardView (https://www.itwinjs.org/reference/core-frontend/views/standardview/) for more details
     */
    viewStateClone?.setStandardRotation(StandardViewId.Top);
    // Make sure both viewports are centered on the same point
    if (viewState?.getCenter())
      viewStateClone?.setCenter(viewState?.getCenter());

    return new ContentGroup({
      id: "sandbox:two-viewstates",
      layout: StandardContentLayouts.twoHorizontalSplit,
      contents: [
        {
          id: "sandbox:two-viewstates-default-content",
          classId: IModelViewportControl,
          applicationData: {
            viewState,
            iModelConnection: iModel,
          },
        },
        {
          id: "sandbox:two-viewstates-rotated-content",
          classId: IModelViewportControl,
          applicationData: {
            viewState: viewStateClone,
            iModelConnection: iModel,
          },
        },
      ],
    });
  }
}

export const TwoViewportsFrontstageProps: StandardFrontstageProps = {
  id: "sandbox:two-viewports-frontstage",
  usage: StageUsage.General,
  contentGroupProps:new TwoViewportsContentGroupProvider(),
  hideNavigationAid: false,
  hideStatusBar: true,
  hideToolSettings: true,
};
