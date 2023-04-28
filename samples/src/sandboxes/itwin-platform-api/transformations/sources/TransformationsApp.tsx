/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useCallback, useEffect, useState } from "react";
import { FrontstageManager } from "@itwin/appui-react";
import { CheckpointConnection, IModelConnection, ViewCreator3d } from "@itwin/core-frontend";
import { Viewer, ViewerFrontstage } from "@itwin/web-viewer-react";
import { authClient } from "./common/AuthorizationClient";
import { mapLayerOptions } from "./common/MapLayerOptions";
import { ViewSetup } from "./common/ViewSetup";
import { TransformationsFrontstage } from "./TransformationsFrontstageProvider";
import { TransformationsWidgetProvider } from "./TransformationsWidget";
import "./transformations.scss";

const uiProviders = [new TransformationsWidgetProvider()];
const transformed_itwinId = "58262a3d-bbc8-45d0-adbc-13a4623c180f";
const transformed_imodelId = "67cf8408-8f3f-4a3a-bde1-a991a422e909";
const iTwinId = process.env.IMJS_ITWIN_ID;
const iModelId = process.env.IMJS_IMODEL_ID;

const TransformationsApp = () => {

  const [frontStages, setFrontstages] = useState<ViewerFrontstage[]>([]);

  const initialSetup = useCallback(async (iModelConnection: IModelConnection) => {

    if (frontStages.length > 0)
      return;

    const viewState = await ViewSetup.getDefaultView(iModelConnection);
    const vf = viewState.viewFlags.copy({});

    // START TRANSFORMED_IMODEL_CONNECTION
    // Connect to iModel
    const connection2 = await CheckpointConnection.openRemote(transformed_itwinId, transformed_imodelId);
    // END TRANSFORMED_IMODEL_CONNECTION

    // Get ViewState
    const viewCreator2 = new ViewCreator3d(connection2);
    const viewState2 = await viewCreator2.createDefaultView({ skyboxOn: true });
    viewState2.viewFlags = vf;

    setFrontstages([{ provider: new TransformationsFrontstage(viewState, viewState2, connection2), default: true }]);
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
    frontstages={frontStages}
    defaultUiConfig={
      {
        hideStatusBar: true,
        hideToolSettings: true,
      }
    }
    uiProviders={uiProviders}
    mapLayerOptions={mapLayerOptions}
    onIModelConnected={initialSetup}
    enablePerformanceMonitors={false}
    theme="dark"
  />;
};

// Define panel size
FrontstageManager.onFrontstageReadyEvent.addListener((event) => {
  const { rightPanel } = event.frontstageDef;
  rightPanel && (rightPanel.size = 250);
});

export default TransformationsApp;
