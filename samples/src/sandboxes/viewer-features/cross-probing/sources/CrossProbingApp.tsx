/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useCallback, useEffect, useState } from "react";
import { FrontstageManager } from "@itwin/appui-react";
import { ColorDef } from "@itwin/core-common";
import { IModelConnection, ViewCreator2d, ViewState } from "@itwin/core-frontend";
import { Viewer, ViewerFrontstage } from "@itwin/web-viewer-react";
import { authClient } from "./common/AuthorizationClient";
import { mapLayerOptions } from "./common/MapLayerOptions";
import { ViewSetup } from "./common/ViewSetup";
import CrossProbingApi from "./CrossProbingApi";
import { CrossProbingFrontstageProvider } from "./CrossProbingFrontstageProvider";
import { InstructionsWidgetProvider } from "./InstructionsWidgetProvider";

const uiProviders = [new InstructionsWidgetProvider()];

const iTwinId = process.env.IMJS_ITWIN_ID;
const iModelId = process.env.IMJS_IMODEL_ID;

const CrossProbingApp = () => {
  const [frontStages, setFrontStages] = useState<ViewerFrontstage[]>([]);

  // Get first 2D view in iModel.
  const getFirst2DView = useCallback(async (imodel: IModelConnection): Promise<ViewState> => {
    const viewCreator = new ViewCreator2d(imodel);
    const models = await imodel.models.queryProps({ from: "BisCore.GeometricModel2d" });
    if (models.length === 0)
      throw new Error("No 2D models found in iModel.");

    return viewCreator.createViewForModel(models[0].id!, { bgColor: ColorDef.black });
  }, []);

  // When iModel is ready, initialize element selection listener and assign initial 2D view.
  const oniModelConnected = useCallback(async (iModelConnection: IModelConnection) => {
    if (frontStages.length > 0)
      return;

    // Add a listen to track what we are clicking
    CrossProbingApi.addElementSelectionListener(iModelConnection);
    // Cache the elements
    await CrossProbingApi.loadElementMap(iModelConnection);
    // Grab the proper view states
    const [viewState2d, viewState3d] = await Promise.all([getFirst2DView(iModelConnection), ViewSetup.getDefaultView(iModelConnection)]);
    // update our frontstage

    setFrontStages([{ provider: new CrossProbingFrontstageProvider(iModelConnection, viewState3d, viewState2d), default: true }]);
  }, [getFirst2DView, frontStages]);

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
    mapLayerOptions={mapLayerOptions}
    onIModelConnected={oniModelConnected}
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
  const { bottomPanel } = event.frontstageDef;
  bottomPanel && (bottomPanel.size = 110);
});

export default CrossProbingApp;
