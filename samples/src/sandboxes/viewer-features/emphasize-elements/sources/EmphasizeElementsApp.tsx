/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { authClient } from "./common/AuthorizationClient";
import { EmphasizeElementsWidgetProvider } from "./EmphasizeElementsWidget";
import { FrontstageManager } from "@itwin/appui-react";
import { mapLayerOptions } from "./common/MapLayerOptions";
import { Viewer, ViewerNavigationToolsProvider } from "@itwin/web-viewer-react";
import { ViewSetup } from "./common/ViewSetup";
import React, { useEffect } from "react";

const uiProviders = [
  new EmphasizeElementsWidgetProvider(),
  new ViewerNavigationToolsProvider(),
];
const viewportOptions = {
  viewState: ViewSetup.getDefaultView,
};

const iTwinId = process.env.IMJS_ITWIN_ID;
const iModelId = process.env.IMJS_IMODEL_ID;

const EmphasizeElementsApp = () => {
  /** Sign-in */
  useEffect(() => {
    void authClient.signIn();
  }, []);

  /** The sample's render method */
  // START VIEWER
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
  // END VIEWER
};

// Define panel size
FrontstageManager.onFrontstageReadyEvent.addListener((event) => {
  const { bottomPanel } = event.frontstageDef;
  bottomPanel && (bottomPanel.size = 180);
});

export default EmphasizeElementsApp;
