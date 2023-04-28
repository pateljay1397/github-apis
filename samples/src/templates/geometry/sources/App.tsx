/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { Cartographic, ColorDef, RenderMode } from "@itwin/core-common";
import { Range3d, Vector3d } from "@itwin/core-geometry";
import { BlankConnectionViewState, Viewer } from "@itwin/web-viewer-react";
import { authClient } from "./common/AuthorizationClient";
import { Simple3dWidgetProvider } from "./GeometryWidget";

const uiProviders = [new Simple3dWidgetProvider()];

const blankConnectionViewState: BlankConnectionViewState = {
  displayStyle: { backgroundColor: ColorDef.white },
  viewFlags: { grid: true, renderMode: RenderMode.SmoothShade },
  setAllow3dManipulations: true,
  lookAt: {
    eyePoint: { x: 25, y: 25, z: 25 },
    targetPoint: { x: 0, y: 0, z: 0 },
    upVector: new Vector3d(0, 0, 1),
  },
};

const iTwinId = process.env.IMJS_ITWIN_ID;

const Simple3dApp = () => {

  /** Sign-in */
  useEffect(() => {
    void authClient.signIn();
  }, []);

  /** The sample's render method */
  return <Viewer
    iTwinId={iTwinId ?? ""}
    authClient={authClient}
    location={Cartographic.createZero()}
    extents={new Range3d(-15, -15, -15, 15, 15, 15)}
    blankConnectionViewState={blankConnectionViewState}
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

export default Simple3dApp;
