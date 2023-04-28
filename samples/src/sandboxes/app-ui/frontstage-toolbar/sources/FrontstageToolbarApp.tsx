/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { Viewer, ViewerFrontstage } from "@itwin/web-viewer-react";
import { authClient } from "./common/AuthorizationClient";
import { mapLayerOptions } from "./common/MapLayerOptions";
import { ViewSetup } from "./common/ViewSetup";
import { FrontstageManager, FrontstageReadyEventArgs, StandardFrontstageProvider } from "@itwin/appui-react";
import { CustomToolbarFrontstageProps } from "./CustomToolbarFrontstage";
import { SimpleCustomTool } from "./tools/SimpleCustomTool";
import { CustomToolbarProvider } from "./CustomToolbarProvider";

const viewportOptions = {
  viewState: ViewSetup.getDefaultView,
};

const _onIModelAppInit = async () => {
  // Register a custom tool so that the various frontstages can use it
  SimpleCustomTool.register(SimpleCustomTool.toolId);
};

// Define your frontstages
const frontstages: ViewerFrontstage[] = [
  {
    provider: new StandardFrontstageProvider(CustomToolbarFrontstageProps),
    default: true,
    requiresIModelConnection: true,
  },
];

// Define UiItemsProvider(s) to populate the "empty" frontstage
const uiProviders = [
  new CustomToolbarProvider(),
];

const iTwinId = process.env.IMJS_ITWIN_ID;
const iModelId = process.env.IMJS_IMODEL_ID;

const ViewportFrontstageApp = () => {

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
    enablePerformanceMonitors={false}
    onIModelAppInit={_onIModelAppInit}
    frontstages={frontstages}
    uiProviders={uiProviders}
    theme="dark"
  />;
};

FrontstageManager.onFrontstageReadyEvent.addListener((event: FrontstageReadyEventArgs) => {
  const { id, bottomPanel } = event.frontstageDef;
  // Define widget panel sizes at runtime
  if (id === "sandbox:custom-toolbar-frontstage") {
    bottomPanel && (bottomPanel.size = 150);
  }
});

export default ViewportFrontstageApp;

