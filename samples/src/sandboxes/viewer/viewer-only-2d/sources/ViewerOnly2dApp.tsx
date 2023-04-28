/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { FrontstageManager } from "@itwin/appui-react";
import { Viewer, ViewerContentToolsProvider, ViewerNavigationToolsProvider, ViewerViewportControlOptions } from "@itwin/web-viewer-react";
import { authClient } from "./common/AuthorizationClient";
import { ViewerOnly2dApi } from "./ViewerOnly2dApi";
import { ViewerOnly2dWidgetProvider } from "./ViewerOnly2dWidget";

const uiProviders = [
  new ViewerOnly2dWidgetProvider(),
  new ViewerNavigationToolsProvider(),
  new ViewerContentToolsProvider(),
];
const viewportOptions: ViewerViewportControlOptions = {
  viewState: async (iModelConnection) => {
    const result = await ViewerOnly2dApi.getInitial2DModel(iModelConnection);
    return ViewerOnly2dApi.createDefaultViewFor2dModel(iModelConnection, result);
  },
};

const iTwinId = process.env.IMJS_ITWIN_ID;
const iModelId = process.env.IMJS_IMODEL_ID;

const ViewportOnly2dApp = () => {
  /** Sign-in */
  useEffect(() => {
    void authClient.signIn();
  }, []);

  return authClient &&
    <Viewer
      iTwinId={iTwinId ?? ""}
      iModelId={iModelId ?? ""}
      authClient={authClient}
      viewportOptions={viewportOptions}
      defaultUiConfig={
        {
          hideNavigationAid: true,
          hideStatusBar: true,
          hideToolSettings: true,
        }
      }
      uiProviders={uiProviders}
      enablePerformanceMonitors={false}
      theme="dark"
    />;
};

// Define panel size
FrontstageManager.onFrontstageReadyEvent.addListener((event) => {
  const { bottomPanel } = event.frontstageDef;
  bottomPanel && (bottomPanel.size = 150);
});

export default ViewportOnly2dApp;
