/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { IModelApp, StandardViewId, ViewChangeOptions, ZoomToOptions } from "@itwin/core-frontend";

export type zoomView = "current" | "standard" | "relative";

export interface ZoomOptions {
  animateEnable: boolean;
  zoomView: zoomView;
  view: StandardViewId;
}

export class ZoomToElementsApi {

  public static zoomToElements = async (elements: string[], options: ZoomOptions) => {
    const viewChangeOpts: ViewChangeOptions = {
      animateFrustumChange: options.animateEnable,
    };

    const zoomToOpts: ZoomToOptions = {};

    if (options.zoomView === "standard")
      zoomToOpts.standardViewId = options.view;

    if (options.zoomView === "relative")
      zoomToOpts.placementRelativeId = options.view;

    const vp = IModelApp.viewManager.selectedView;

    // Set the view to point at a volume containing the list of elements
    if(vp)
      await vp.zoomToElements(elements, { ...viewChangeOpts, ...zoomToOpts });
  };
}
