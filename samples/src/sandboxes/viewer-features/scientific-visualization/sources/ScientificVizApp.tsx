/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { FrontstageManager } from "@itwin/appui-react";
import { Cartographic, ColorDef, RenderMode } from "@itwin/core-common";
import { Range3d } from "@itwin/core-geometry";
import { BlankConnectionViewState, Viewer, ViewerViewportControlOptions } from "@itwin/web-viewer-react";
import { ScientificVizWidgetProvider } from "./ScientificVizWidget";
import { authClient } from "./common/AuthorizationClient";

const uiProviders = [new ScientificVizWidgetProvider()];
const viewportOptions: ViewerViewportControlOptions = {
  supplyViewOverlay: () => null,
};
const viewState: BlankConnectionViewState = {
  displayStyle: {
    backgroundColor: ColorDef.white,
  },
  viewFlags: {
    grid: false,
    renderMode: RenderMode.SolidFill,
  },
  setAllow3dManipulations: true,
};

const ScientificVizApp = () => {

  /** Sign-in */
  useEffect(() => {
    void authClient.signIn();
  }, []);

  /** The sample's render method */
  return <Viewer
    iTwinId="none"
    authClient={authClient}
    location={Cartographic.fromDegrees({ longitude: 0, latitude: 0, height: 0 })}
    extents={new Range3d(0, 0, -100, 50, 50, 50)}
    blankConnectionViewState={viewState}
    uiProviders={uiProviders}
    viewportOptions={viewportOptions}
    defaultUiConfig={
      {
        hideNavigationAid: true,
        hideStatusBar: true,
        hideToolSettings: true,
      }
    }
    enablePerformanceMonitors={true}
    theme="dark"
  />;
};

// Define panel size
FrontstageManager.onFrontstageReadyEvent.addListener((event) => {
  const { bottomPanel } = event.frontstageDef;
  bottomPanel && (bottomPanel.size = 165);
});

export default ScientificVizApp;
