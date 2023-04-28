/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { FrontstageManager } from "@itwin/appui-react";
import { Cartographic, ColorDef, RenderMode } from "@itwin/core-common";
import { IModelApp, ScreenViewport, StandardViewId } from "@itwin/core-frontend";
import { Range3d } from "@itwin/core-geometry";
import { BlankConnectionViewState, Viewer } from "@itwin/web-viewer-react";
import { Transformations2dWidgetProvider } from "./2dTransformationsWidget";
import { authClient } from "./common/AuthorizationClient";

const uiProviders = [new Transformations2dWidgetProvider()];

const blankConnectionViewState: BlankConnectionViewState = {
  displayStyle: { backgroundColor: ColorDef.white },
  viewFlags: { grid: true, renderMode: RenderMode.SmoothShade },
  setAllow3dManipulations: false,
};

const setupView = (vp: ScreenViewport) => {
  if (vp && vp.view.is3d()) {
    vp.setStandardRotation(StandardViewId.Top);
    vp.synchWithView();
  }
};

const Transformations2dApp = () => {
  /** Sign-in */
  useEffect(() => {
    void authClient.signIn();
  }, []);

  /** The sample's render method */
  return authClient &&
    <Viewer
      iTwinId="none"
      authClient={authClient}
      location={Cartographic.createZero()}
      extents={new Range3d(-10, -10, -10, 10, 10, 10)}
      blankConnectionViewState={blankConnectionViewState}
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
  bottomPanel && (bottomPanel.size = 175);
});

export default Transformations2dApp;
