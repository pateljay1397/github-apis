/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useCallback, useEffect, useState } from "react";
import { FrontstageManager } from "@itwin/appui-react";
import { IModelConnection } from "@itwin/core-frontend";
import { Viewer, ViewerFrontstage } from "@itwin/web-viewer-react";
import { authClient } from "./common/AuthorizationClient";
import { mapLayerOptions } from "./common/MapLayerOptions";
import { ViewSetup } from "./common/ViewSetup";
import { MultiViewportFrontstage } from "./MultiViewportFrontstageProvider";
import { MultiViewportWidgetProvider } from "./MultiViewportWidget";

const uiProviders = [new MultiViewportWidgetProvider()];

const iTwinId = process.env.IMJS_ITWIN_ID;
const iModelId = process.env.IMJS_IMODEL_ID;

const MultiViewportApp = () => {
  const [frontStages, setFrontstages] = useState<ViewerFrontstage[]>([]);

  const initialViewstate = useCallback(async (iModelConnection: IModelConnection) => {
    if (frontStages.length === 0) {
      const viewState = await ViewSetup.getDefaultView(iModelConnection);
      setFrontstages(() => [{ provider: new MultiViewportFrontstage(viewState), default: true }]);
    }
  }, [frontStages]);

  /** Sign-in */
  useEffect(() => {
    void authClient.signIn();
  }, []);

  /** The sample's render method */
  return <Viewer
    iTwinId={iTwinId ?? ""}
    iModelId={iModelId ?? ""}
    authClient={authClient}
    mapLayerOptions={mapLayerOptions}
    frontstages={frontStages}
    onIModelConnected={initialViewstate}
    uiProviders={uiProviders}
    defaultUiConfig={
      {
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
  bottomPanel && (bottomPanel.size = 155);
});

export default MultiViewportApp;
