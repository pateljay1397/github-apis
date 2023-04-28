/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect, useMemo } from "react";
import { Viewer, ViewerNavigationToolsProvider } from "@itwin/web-viewer-react";
import { FrontstageManager } from "@itwin/appui-react";
import { authClient } from "./common/AuthorizationClient";
import { mapLayerOptions } from "./common/MapLayerOptions";
import { ViewSetup } from "./common/ViewSetup";
import { createDefaultMappingClient, GroupingMappingProvider } from "@itwin/grouping-mapping-widget";
import { LazyLoadingInMemoryMappingClient } from "./LazyLoadingInMemoryMappingClient";

const iTwinId = process.env.IMJS_ITWIN_ID;
const iModelId = process.env.IMJS_IMODEL_ID;

const mappingClient = new LazyLoadingInMemoryMappingClient(createDefaultMappingClient());
const uiProviders = [
  new GroupingMappingProvider({ client: mappingClient }),
  new ViewerNavigationToolsProvider(),
];

const GroupingMappingApp = () => {
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
  const { leftPanel } = event.frontstageDef;
  leftPanel && (leftPanel.size = 550);
});

export default GroupingMappingApp;
