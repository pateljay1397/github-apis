/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { FrontstageManager } from "@itwin/appui-react";
import { Cartographic, ColorDef, RenderMode } from "@itwin/core-common";
import { IModelApp, ScreenViewport, StandardViewId } from "@itwin/core-frontend";
import { Range3d, Vector3d } from "@itwin/core-geometry";
import { BlankConnectionViewState, Viewer } from "@itwin/web-viewer-react";
import { authClient } from "./common/AuthorizationClient";
import { Simple3dWidgetProvider } from "./Simple3dWidget";

const uiProviders = [new Simple3dWidgetProvider()];

const viewState: BlankConnectionViewState = {
  displayStyle: { backgroundColor: ColorDef.white },
  viewFlags: { grid: true, renderMode: RenderMode.SmoothShade },
  setAllow3dManipulations: true,
  lookAt: {
    eyePoint: { x: 25, y: 25, z: 25 },
    targetPoint: { x: 0, y: 0, z: 0 },
    upVector: new Vector3d(0, 0, 1),
  },
};

const setupView = (vp: ScreenViewport) => {
  if (vp && vp.view.is3d()) {
    vp.setStandardRotation(StandardViewId.Iso);
    vp.synchWithView();
  }
};

const Simple3dApp = () => {
  /** Sign-in */
  useEffect(() => {
    void authClient.signIn();
  }, []);

  /** The sample's render method */
  return <Viewer
    iTwinId="none"
    authClient={authClient}
    location={Cartographic.createZero()}
    extents={new Range3d(-35, -35, -35, 35, 35, 35)}
    blankConnectionViewState={viewState}
    uiProviders={uiProviders}
    onIModelConnected={() => IModelApp.viewManager.onViewOpen.addOnce(setupView)}
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
  const { bottomPanel } = event.frontstageDef;
  bottomPanel && (bottomPanel.size = 150);
});

export default Simple3dApp;
