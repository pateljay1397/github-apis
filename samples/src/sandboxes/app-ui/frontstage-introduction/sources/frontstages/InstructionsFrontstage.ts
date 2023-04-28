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

export class InstructionsContentGroupProvider extends ContentGroupProvider {
  public async provideContentGroup(_props: FrontstageProps): Promise<ContentGroup> {
    const iModel = UiFramework.getIModelConnection();
    let viewState;
    /**
     * An important note: The sandbox provides a helper file called ViewSetup.ts
     * that handles setting up the default view. However, in your own application,
     * there won't be such a file. Thus, it is possible that the defaultViewId is 0,
     * which is considered an invalid Id64 and will cause the frontstage to load no content.
     */
    const defaultViewId = await iModel?.views?.queryDefaultViewId();
    if (defaultViewId && Id64.isValidId64(defaultViewId)) {
      viewState = await iModel?.views.load(defaultViewId);
      viewState && UiFramework.setDefaultViewState(viewState.clone());
    }

    /**
     * IModelViewportControl is a helpful class that allows you to easily configure the
     * iModel viewport for your frontstage. If you want a view of your iModel, in most
     * instances you should be using this class.
     */
    return new ContentGroup({
      id: "sandbox:instructions",
      layout: StandardContentLayouts.singleView,
      contents: [
        {
          id: "sandbox:instructions-content",
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

export const InstructionsFrontstageProps: StandardFrontstageProps = {
  // Required props:
  // Unique identifier for the frontstage
  id: "sandbox:instructions-frontstage",
  // Allows you to group frontstages by usage. For example, allows you to say "Only display this toolbar for frontstages with usage ViewOnly"
  usage: StageUsage.General,
  // Provides the content contained in the frontstage (For example, the widgets, tools, toolbars, etc.)
  contentGroupProps:new InstructionsContentGroupProvider(),
  // Optional props for hiding default UI:
  // Hides rotation cube in upper right corner
  hideNavigationAid: true,
  // Hides status bar at bottom of Viewer
  hideStatusBar: true,
  // Hides tool settings bar at top of Viewer.
  hideToolSettings: true,
};
