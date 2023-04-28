/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { FrontstageManager } from "@itwin/appui-react";
import { RenderMode } from "@itwin/core-common";
import { Viewer, ViewerViewportControlOptions } from "@itwin/web-viewer-react";
import { CameraPathWidgetProvider } from "./CameraPathWidget";
import { authClient } from "./common/AuthorizationClient";
import { mapLayerOptions } from "./common/MapLayerOptions";
import { ViewSetup } from "./common/ViewSetup";

const uiProviders = [new CameraPathWidgetProvider()];
/** Setup view state */
const viewportOptions: ViewerViewportControlOptions = {
  viewState: async (iModelConnection) => {
    const viewState = await ViewSetup.getDefaultView(iModelConnection);
    viewState.viewFlags = viewState.viewFlags.withRenderMode(RenderMode.SmoothShade);
    return viewState;
  },
};

const iTwinId = process.env.IMJS_ITWIN_ID;
const iModelId = process.env.IMJS_IMODEL_ID;

const CameraPathApp = () => {
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
    defaultUiConfig={
      {
        hideNavigationAid: true,
        hideStatusBar: true,
        hideToolSettings: true,
      }
    }
    uiProviders={uiProviders}
    enablePerformanceMonitors={false}
    mapLayerOptions={mapLayerOptions}
    theme="dark"
  />;
};

// Define panel size
FrontstageManager.onFrontstageReadyEvent.addListener((event) => {
  const { bottomPanel } = event.frontstageDef;
  bottomPanel && (bottomPanel.size = 140);
});

export default CameraPathApp;
