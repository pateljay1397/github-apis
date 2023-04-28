/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { FrontstageManager } from "@itwin/appui-react";
import { ScreenViewport } from "@itwin/core-frontend";
import { Viewer, ViewerNavigationToolsProvider } from "@itwin/web-viewer-react";
import { authClient } from "./common/AuthorizationClient";
import { ViewSetup } from "./common/ViewSetup";
import HyperModelingApi from "./HyperModelingApi";
import { HyperModelingWidgetProvider } from "./HyperModelingWidget";

const uiProviders = [
  new HyperModelingWidgetProvider(),
  new ViewerNavigationToolsProvider(),
];
const viewportOptions = {
  viewState: ViewSetup.getDefaultView,
};
const onIModelInit = () => HyperModelingApi.onReady.addListener((view: ScreenViewport) => {
  HyperModelingApi.activateMarkerByName(view, "Section-Left")
    .catch((error) => console.error(error));
});

const iTwinId = process.env.IMJS_ITWIN_ID;
const iModelId = process.env.IMJS_IMODEL_ID;

const HyperModelingApp = () => {
  /** Sign-in */
  useEffect(() => {
    void authClient.signIn();
  }, []);

  return authClient &&
    <Viewer
      iTwinId={iTwinId ?? ""}
      iModelId={iModelId ?? ""}
      authClient={authClient}
      onIModelAppInit={onIModelInit}
      viewportOptions={viewportOptions}
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
  bottomPanel && (bottomPanel.size = 170);
});

export default HyperModelingApp;
