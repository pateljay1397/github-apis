/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect, useMemo } from "react";
import { FrontstageManager } from "@itwin/appui-react";
import { Viewer, ViewerNavigationToolsProvider } from "@itwin/web-viewer-react";
import { authClient } from "./common/AuthorizationClient";
import { mapLayerOptions, tileAdminOptions } from "./common/MapLayerOptions";
import { ViewSetup } from "./common/ViewSetup";
import { MappingODataUiProvider } from "./MappingODataUiProvider";

const iTwinId = process.env.IMJS_ITWIN_ID;
const iModelId = process.env.IMJS_IMODEL_ID;

const IModelODataApp = () => {

  const viewportOptions = useMemo(() => ({
    viewState: ViewSetup.getDefaultView,
  }), []);

  /** Sign-in */
  useEffect(() => {
    void authClient.signIn();
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
    viewportOptions={viewportOptions}
    mapLayerOptions={mapLayerOptions}
    tileAdmin={tileAdminOptions}
    theme="dark"
    uiProviders={[
      new MappingODataUiProvider(),
      new ViewerNavigationToolsProvider(),
    ]}
  />;
};

// Define panel size
FrontstageManager.onFrontstageReadyEvent.addListener((event) => {
  const { bottomPanel } = event.frontstageDef;
  bottomPanel && (bottomPanel.size = 450);
});

export default IModelODataApp;
