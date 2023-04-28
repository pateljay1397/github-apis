/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { FrontstageManager } from "@itwin/appui-react";
import { Viewer, ViewerNavigationToolsProvider } from "@itwin/web-viewer-react";
import { authClient } from "./common/AuthorizationClient";
import { ViewSetup } from "./common/ViewSetup";
import { FireDecorationWidgetProvider } from "./FireDecorationWidget";

const uiProviders = [
  new FireDecorationWidgetProvider(),
  new ViewerNavigationToolsProvider(),
];
const viewportOptions = {
  viewState: ViewSetup.getDefaultView,
};

const iTwinId = process.env.IMJS_ITWIN_ID;
const iModelId = process.env.IMJS_IMODEL_ID;

const FireDecorationApp = () => {
  /** Sign-in */
  useEffect(() => {
    void authClient.signIn();
  }, []);

  /** The sample's render method */
  return authClient &&
    <Viewer
      iTwinId={iTwinId ?? ""}
      iModelId={iModelId ?? ""}
      authClient={authClient}
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
  bottomPanel && (bottomPanel.size = 200);
});

export default FireDecorationApp;
