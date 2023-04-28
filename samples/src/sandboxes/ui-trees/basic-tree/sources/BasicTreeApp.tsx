/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { FrontstageManager } from "@itwin/appui-react";
import { Cartographic } from "@itwin/core-common";
import { Range3d } from "@itwin/core-geometry";
import { Viewer } from "@itwin/web-viewer-react";
import { BasicTreeComponent } from "./BasicTreeComponent";
import { BlankFrontstage } from "./BlankFrontstage";
import { authClient } from "./common/AuthorizationClient";
import { InstructionsWidgetProvider } from "./InstructionsWidgetProvider";
import "./BasicTree.scss";

const uiProviders = [new InstructionsWidgetProvider()];
const frontstages = [{ provider: new BlankFrontstage(BasicTreeComponent), default: true, requiresIModelConnection: true }];

const BasicTreeApp = () => {
  /** Sign-in */
  useEffect(() => {
    void authClient.signIn();
  }, []);

  return <Viewer
    iTwinId="none"
    authClient={authClient}
    extents={new Range3d()}
    location={Cartographic.createZero()}
    frontstages={frontstages}
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
  const { bottomPanel } = event.frontstageDef;
  bottomPanel && (bottomPanel.size = 110);
});

export default BasicTreeApp;
