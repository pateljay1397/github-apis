/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { FrontstageManager } from "@itwin/appui-react";
import { Viewer, ViewerNavigationToolsProvider, ViewerViewportControlOptions } from "@itwin/web-viewer-react";
import ShadowStudyApi from "./ShadowStudyApi";
import { ShadowStudyWidgetProvider } from "./ShadowStudyWidget";
import { authClient } from "./common/AuthorizationClient";
import { mapLayerOptions } from "./common/MapLayerOptions";

const uiProviders = [
  new ShadowStudyWidgetProvider(),
  new ViewerNavigationToolsProvider(),
];
const viewportOptions: ViewerViewportControlOptions = {
  viewState: async (iModelConnection) => ShadowStudyApi.getInitialView(iModelConnection),
};

const iTwinId = process.env.IMJS_ITWIN_ID;
const iModelId = process.env.IMJS_IMODEL_ID;

const ShadowStudyApp = () => {
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
  const { bottomPanel } = event.frontstageDef;
  bottomPanel && (bottomPanel.size = 175);
});

export default ShadowStudyApp;
