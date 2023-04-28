/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { FrontstageManager } from "@itwin/appui-react";
import { Viewer } from "@itwin/web-viewer-react";
import { BlankFrontstage } from "./BlankFrontstage";
import { authClient } from "./common/AuthorizationClient";
import { CustomWebfontIconsTree } from "./CustomWebfontIconsTreeComponent";
import { InstructionsWidgetProvider } from "./InstructionsWidgetProvider";
import "./CustomWebfontIconsTree.scss";

const uiProviders = [new InstructionsWidgetProvider()];
const frontstages = [{ provider: new BlankFrontstage(CustomWebfontIconsTree), default: true, requiresIModelConnection: true }];
const iTwinId = process.env.IMJS_ITWIN_ID;
const iModelId = process.env.IMJS_IMODEL_ID;

const CustomWebfontIconsTreeApp = () => {
  /** Sign-in */
  useEffect(() => {
    void authClient.signIn();
  }, []);

  return <Viewer
    iTwinId={iTwinId ?? ""}
    iModelId={iModelId ?? ""}
    authClient={authClient}
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
  bottomPanel && (bottomPanel.size = 150);
});

export default CustomWebfontIconsTreeApp;
