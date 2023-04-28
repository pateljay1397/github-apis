/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useCallback, useEffect } from "react";
import { FrontstageManager } from "@itwin/appui-react";
import { IModelConnection } from "@itwin/core-frontend";
import { Viewer, ViewerContentToolsProvider, ViewerNavigationToolsProvider } from "@itwin/web-viewer-react";
import { ChangedElementsApi } from "./ChangedElementsApi";
import { ChangedElementsClient } from "./ChangedElementsClient";
import { ChangedElementsWidgetProvider } from "./ChangedElementsWidget";
import { authClient } from "./common/AuthorizationClient";
import { mapLayerOptions } from "./common/MapLayerOptions";
import { ViewSetup } from "./common/ViewSetup";

const uiProviders = [
  new ChangedElementsWidgetProvider(),
  new ViewerContentToolsProvider(),
  new ViewerNavigationToolsProvider(),
];
const viewportOptions = {
  viewState: ViewSetup.getDefaultView,
};

const iTwinId = process.env.IMJS_ITWIN_ID;
const iModelId = process.env.IMJS_IMODEL_ID;

const ChangedElementsApp = () => {
  const oniModelReady = useCallback(async (iModelConnection: IModelConnection) => {
    // Populate the information needed for this sample.
    await ChangedElementsClient.populateContext(iModelConnection);
    await ChangedElementsApi.populateVersions();
  }, []);

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
    onIModelConnected={oniModelReady}
    uiProviders={uiProviders}
    mapLayerOptions={mapLayerOptions}
    enablePerformanceMonitors={false}
    defaultUiConfig={
      {
        hideStatusBar: true,
        hideToolSettings: true,
      }
    }
    theme="dark"
  />;
};

// Define panel size
FrontstageManager.onFrontstageReadyEvent.addListener((event) => {
  const { bottomPanel } = event.frontstageDef;
  bottomPanel && (bottomPanel.size = 265);
});

export default ChangedElementsApp;
