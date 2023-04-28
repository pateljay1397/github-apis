/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { FrontstageManager } from "@itwin/appui-react";
import { Viewer, ViewerNavigationToolsProvider } from "@itwin/web-viewer-react";
import { authClient } from "./common/AuthorizationClient";
import { mapLayerOptions } from "./common/MapLayerOptions";
import { ReportingApi } from "./ReportingApi";
import { ReportingWidgetProvider } from "./ReportingWidget";

const uiProviders = [
  new ReportingWidgetProvider(),
  new ViewerNavigationToolsProvider(),
];

const iTwinId = process.env.IMJS_ITWIN_ID;
const iModelId = process.env.IMJS_IMODEL_ID;

const Simple3dApp = () => {

  /** Sign-in */
  useEffect(() => {
    void authClient.signIn().then(() => {
      ReportingApi.populateGroups(iTwinId!)
        .catch((error) => console.error(`Error occurs when switching iModel. ${error}`));
    });
  }, []);

  /** The sample's render method */
  return <Viewer
    iTwinId={iTwinId ?? ""}
    iModelId={iModelId ?? ""}
    authClient={authClient}
    enablePerformanceMonitors={false}
    defaultUiConfig={
      {
        hideStatusBar: true,
        hideToolSettings: true,
      }
    }
    uiProviders={uiProviders}
    mapLayerOptions={mapLayerOptions}
    theme="dark"
  />;
};

// Define panel size
FrontstageManager.onFrontstageReadyEvent.addListener((event) => {
  const { bottomPanel } = event.frontstageDef;
  bottomPanel && (bottomPanel.size = 350);
});

export default Simple3dApp;
