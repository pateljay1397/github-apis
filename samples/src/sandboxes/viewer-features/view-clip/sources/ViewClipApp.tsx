/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { FrontstageManager } from "@itwin/appui-react";
import { Viewer, ViewerNavigationToolsProvider, ViewerViewportControlOptions } from "@itwin/web-viewer-react";
import { authClient } from "./common/AuthorizationClient";
import { mapLayerOptions } from "./common/MapLayerOptions";
import ViewClipApi from "./ViewClipApi";
import { ViewClipWidgetProvider } from "./ViewClipWidget";

const uiProviders = [
  new ViewClipWidgetProvider(),
  new ViewerNavigationToolsProvider(),
];
const viewportOptions: ViewerViewportControlOptions = {
  viewState: async (iModelConnection) => ViewClipApi.getIsoView(iModelConnection),
};

const iTwinId = process.env.IMJS_ITWIN_ID;
const iModelId = process.env.IMJS_IMODEL_ID;

const ViewClipApp = () => {
  /** Sign-in */
  useEffect(() => {
    void authClient.signIn();
  }, []);

  /** The sample's render method */
  return authClient &&
    <Viewer
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
  const { bottomPanel } = event.frontstageDef;
  bottomPanel && (bottomPanel.size = 150);
});

export default ViewClipApp;
