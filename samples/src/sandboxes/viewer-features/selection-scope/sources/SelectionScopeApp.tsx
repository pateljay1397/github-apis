/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { Viewer, ViewerNavigationToolsProvider } from "@itwin/web-viewer-react";
import { authClient } from "./common/AuthorizationClient";
import { mapLayerOptions } from "./common/MapLayerOptions";
import { ViewSetup } from "./common/ViewSetup";
import { FrontstageManager } from "@itwin/appui-react";
import { SelectionScopeWidgetProvider } from "./SelectionScopeWidgetProvider";
import { ContextProvider } from "./ContextProvider";

const uiProviders = [
  new SelectionScopeWidgetProvider(),
  new ViewerNavigationToolsProvider(),
];
const viewportOptions = {
  viewState: ViewSetup.getDefaultView,
};

const iTwinId = process.env.IMJS_ITWIN_ID;
const iModelId = process.env.IMJS_IMODEL_ID;

const ViewportFrontstageApp = () => {
  /** Sign-in */
  useEffect(() => {
    void authClient.signIn();
  }, []);

  /** The sample's render method */
  return (
    <ContextProvider>
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
      />
    </ContextProvider>
  );
};

// Define panel sizes
FrontstageManager.onFrontstageReadyEvent.addListener((event) => {
  const { rightPanel, bottomPanel } = event.frontstageDef;
  rightPanel && (rightPanel.size = 400);
  bottomPanel && (bottomPanel.size = 175);
});

export default ViewportFrontstageApp;
