/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { FrontstageManager } from "@itwin/appui-react";
import { Viewer, ViewerContentToolsProvider, ViewerNavigationToolsProvider } from "@itwin/web-viewer-react";
import { ClashTestsWidgetProvider } from "./ClashTestsWidget";
import { ClashRunsWidgetProvider } from "./ClashRunsWidget";
import { ClashResultsWidgetProvider } from "./ClashResultsWidget";
import { ClashSuppressionRulesWidgetProvider } from "./ClashSuppressionRulesWidget";
import { SettingsWidgetProvider } from "./SettingsWidget";
import { authClient } from "./common/AuthorizationClient";
import { ViewSetup } from "./common/ViewSetup";

const uiProviders = [
  new ClashTestsWidgetProvider(),
  new ClashRunsWidgetProvider(),
  new ClashResultsWidgetProvider(),
  new ClashSuppressionRulesWidgetProvider(),
  new SettingsWidgetProvider(),
  new ViewerContentToolsProvider(),
  new ViewerNavigationToolsProvider(),
];
const viewportOptions = {
  viewState: ViewSetup.getDefaultView,
};

const iTwinId = process.env.IMJS_ITWIN_ID;
const iModelId = process.env.IMJS_IMODEL_ID;

const ClashReviewApp = () => {
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
  const { bottomPanel, leftPanel, rightPanel } = event.frontstageDef;
  bottomPanel && (bottomPanel.size = 250);
  rightPanel && (rightPanel.size = 200);
  leftPanel && (leftPanel.size = 210);
});

export default ClashReviewApp;
