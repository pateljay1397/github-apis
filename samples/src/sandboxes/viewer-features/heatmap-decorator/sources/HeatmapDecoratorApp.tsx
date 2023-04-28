/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { FrontstageManager } from "@itwin/appui-react";
import { ColorDef } from "@itwin/core-common";
import { StandardViewId } from "@itwin/core-frontend";
import { Viewer, ViewerViewportControlOptions } from "@itwin/web-viewer-react";
import { authClient } from "./common/AuthorizationClient";
import { mapLayerOptions } from "./common/MapLayerOptions";
import { ViewSetup } from "./common/ViewSetup";
import { HeatmapDecoratorWidgetProvider } from "./HeatmapDecoratorWidget";

const uiProviders = [new HeatmapDecoratorWidgetProvider()];
const viewportOptions: ViewerViewportControlOptions = {
  viewState: async (iModelConnection) => {
    const viewState = await ViewSetup.getDefaultView(iModelConnection);
    if (viewState.is3d()) {
      // To make the heatmap look better, lock the view to a top orientation with camera turned off.
      viewState.setAllow3dManipulations(false);
      viewState.turnCameraOff();
      viewState.setStandardRotation(StandardViewId.Top);
    }

    const range = viewState.computeFitRange();
    const aspect = ViewSetup.getAspectRatio();

    viewState.lookAtVolume(range, aspect);

    // The heatmap looks better against a white background.
    viewState.displayStyle.backgroundColor = ColorDef.white;
    return viewState;
  },
};

const iTwinId = process.env.IMJS_ITWIN_ID;
const iModelId = process.env.IMJS_IMODEL_ID;

const HeatmapDecoratorApp = () => {
  /** Sign-in */
  useEffect(() => {
    void authClient.signIn();
  }, []);

  /** The sample's render method */
  return <Viewer
    iTwinId={iTwinId ?? ""}
    iModelId={iModelId ?? ""}
    authClient={authClient}
    viewportOptions={viewportOptions}
    mapLayerOptions={mapLayerOptions}
    uiProviders={uiProviders}
    defaultUiConfig={
      {
        hideNavigationAid: true,
        hideStatusBar: true,
        hideToolSettings: true,
      }
    }
    enablePerformanceMonitors={false}
    theme="dark"
  />;
};

// Define panel size
FrontstageManager.onFrontstageReadyEvent.addListener((event) => {
  const { rightPanel } = event.frontstageDef;
  rightPanel && (rightPanel.size = 200);
});

export default HeatmapDecoratorApp;
