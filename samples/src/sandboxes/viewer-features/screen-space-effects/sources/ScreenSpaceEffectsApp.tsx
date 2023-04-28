/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { FrontstageManager } from "@itwin/appui-react";
import { Viewer, ViewerNavigationToolsProvider, ViewerViewportControlOptions } from "@itwin/web-viewer-react";
import { authClient } from "./common/AuthorizationClient";
import { mapLayerOptions } from "./common/MapLayerOptions";
import { ViewSetup } from "./common/ViewSetup";
import { ScreenSpaceEffectsWidgetProvider } from "./ScreenSpaceEffectsWidget";

const uiProviders = [
  new ScreenSpaceEffectsWidgetProvider(),
  new ViewerNavigationToolsProvider(),
];
const viewportOptions: ViewerViewportControlOptions = {
  viewState: async (iModelConnection) => {
    const viewState = await ViewSetup.getDefaultView(iModelConnection);
    viewState.viewFlags = viewState.viewFlags.with("grid", false);
    return viewState;
  },
};

const iTwinId = process.env.IMJS_ITWIN_ID;
const iModelId = process.env.IMJS_IMODEL_ID;

const ScreenSpaceEffectsApp = () => {
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
  rightPanel && (rightPanel.size = 260);
});

export default ScreenSpaceEffectsApp;
