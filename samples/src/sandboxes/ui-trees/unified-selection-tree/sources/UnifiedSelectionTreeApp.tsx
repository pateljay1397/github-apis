/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { FrontstageManager } from "@itwin/appui-react";
import { Viewer } from "@itwin/web-viewer-react";
import { authClient } from "./common/AuthorizationClient";
import { mapLayerOptions } from "./common/MapLayerOptions";
import { ViewSetup } from "./common/ViewSetup";
import { InstructionsWidgetProvider } from "./InstructionsWidgetProvider";
import { UnifiedSelectionWidgetProvider } from "./UnifiedSelectionTreeWidget";

const uiProviders = [new UnifiedSelectionWidgetProvider(), new InstructionsWidgetProvider()];
const viewportOptions = {
  viewState: ViewSetup.getDefaultView,
};
const iTwinId = process.env.IMJS_ITWIN_ID;
const iModelId = process.env.IMJS_IMODEL_ID;

const UnifiedSelectionApp = () => {
  /** Sign-in */
  useEffect(() => {
    void authClient.signIn();
  }, []);

  return <Viewer
    iTwinId={iTwinId ?? ""}
    iModelId={iModelId ?? ""}
    authClient={authClient}
    viewportOptions={viewportOptions}
    mapLayerOptions={mapLayerOptions}
    uiProviders={uiProviders}
    defaultUiConfig={
      {
        hideNavigationAid: true,
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
  const { bottomPanel, rightPanel } = event.frontstageDef;
  bottomPanel && (bottomPanel.size = 110);
  rightPanel && (rightPanel.size = 200);
});

export default UnifiedSelectionApp;
