/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { FrontstageManager } from "@itwin/appui-react";
import { Angle, Point3d, Vector3d, YawPitchRollAngles } from "@itwin/core-geometry";
import { Viewer, ViewerNavigationToolsProvider, ViewerViewportControlOptions } from "@itwin/web-viewer-react";
import { ClassifierWidgetProvider } from "./ClassifierWidget";
import { authClient } from "./common/AuthorizationClient";
import { mapLayerOptions } from "./common/MapLayerOptions";
import { ViewSetup } from "./common/ViewSetup";

const uiProviders = [
  new ClassifierWidgetProvider(),
  new ViewerNavigationToolsProvider(),
];
const viewportOptions: ViewerViewportControlOptions = {
  viewState: async (iModelConnection) => {
    const viewState = await ViewSetup.getDefaultView(iModelConnection);

    if (viewState.is3d()) {
      viewState.setFocusDistance(375);
      viewState.setRotation(YawPitchRollAngles.createDegrees(30, -35.2, -44).toMatrix3d());
      viewState.setEyePoint(Point3d.create(-1141.7, -1048.9, 338.3));
      viewState.setLensAngle(Angle.createRadians(58.5));
    }

    viewState.setOrigin(Point3d.create(-1270.3, -647.2, -38.9));
    viewState.setExtents(new Vector3d(750, 393, 375));

    return viewState;
  },
};

const iTwinId = process.env.IMJS_ITWIN_ID;
const iModelId = process.env.IMJS_IMODEL_ID;

const ClassifierApp = () => {
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
  const { rightPanel } = event.frontstageDef;
  rightPanel && (rightPanel.size = 250);
});

export default ClassifierApp;
