/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { FrontstageManager } from "@itwin/appui-react";
import { IModelConnection, StandardViewId } from "@itwin/core-frontend";
import { Viewer, ViewerViewportControlOptions } from "@itwin/web-viewer-react";
import { ValidationTestsWidgetProvider } from "./ValidationTestsWidget";
import { ValidationRunsWidgetProvider } from "./ValidationRunsWidget";
import { ValidationResultsWidgetProvider } from "./ValidationResultsWidget";
import { ValidationRulesWidgetProvider } from "./ValidationRulesWidget";
import { SettingsWidgetProvider } from "./SettingsWidget";
import { authClient } from "./common/AuthorizationClient";
import { ViewSetup } from "./common/ViewSetup";

const uiProviders = [
  new SettingsWidgetProvider(),
  new ValidationTestsWidgetProvider(),
  new ValidationRunsWidgetProvider(),
  new ValidationResultsWidgetProvider(),
  new ValidationRulesWidgetProvider(),
];
const viewportOptions: ViewerViewportControlOptions = {
  viewState: async (iModelConnection: IModelConnection) => {
    const viewState = await ViewSetup.getDefaultView(iModelConnection);
    viewState.setStandardRotation(StandardViewId.Iso);

    const range = viewState.computeFitRange();
    const aspect = viewState.getAspectRatio();

    viewState.lookAtVolume(range, aspect);
    return viewState;
  },
};

const iTwinId = process.env.IMJS_ITWIN_ID;
const iModelId = process.env.IMJS_IMODEL_ID;

const ValidationApp = () => {
  /** Sign-in */
  useEffect(() => {
    void authClient.signIn();
  }, []);

  return <Viewer
    iTwinId={iTwinId ?? ""}
    iModelId={iModelId ?? ""}
    authClient={authClient}
    viewportOptions={viewportOptions}
    defaultUiConfig={
      {
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
  const { bottomPanel, leftPanel, rightPanel } = event.frontstageDef;
  bottomPanel && (bottomPanel.size = 250);
  rightPanel && (rightPanel.size = 200);
  leftPanel && (leftPanel.size = 235);
});

export default ValidationApp;
