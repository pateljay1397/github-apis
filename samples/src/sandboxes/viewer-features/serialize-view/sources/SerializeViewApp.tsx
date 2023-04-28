/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { Viewer, ViewerViewportControlOptions } from "@itwin/web-viewer-react";
import { SerializeViewWidgetProvider } from "./SerializeViewWidget";
import { FrontstageManager } from "@itwin/appui-react";
import SerializeViewApi from "./SerializeViewApi";
import { ViewState } from "@itwin/core-frontend";
import { sampleViewStates } from "./SampleViewStates";
import { authClient } from "./common/AuthorizationClient";
import { ViewSetup } from "./common/ViewSetup";
import { mapLayerOptions } from "./common/MapLayerOptions";

const uiProviders = [new SerializeViewWidgetProvider()];

const viewportOptions: ViewerViewportControlOptions = {
  viewState: async (iModelConnection: any) => {
    /** Grab the IModel with views that match the imodel loaded. */
    const iModelWithViews = sampleViewStates.filter((iModelViews) => {
      return iModelViews.iModelId === iModelConnection.iModelId;
    });

    /** Grab the views of the iModel just loaded and load the first view state in the SampleViewStates.ts */
    if (iModelWithViews.length > 0) {
      const views = iModelWithViews[0].views;
      return (SerializeViewApi.deserializeViewState(iModelConnection, views[0].view) as Promise<ViewState>);
    } else {
      return ViewSetup.getDefaultView(iModelConnection);
    }
  },
};

const iTwinId = process.env.IMJS_ITWIN_ID;
const iModelId = process.env.IMJS_IMODEL_ID;

const SerializeViewApp = () => {
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
    viewportOptions={viewportOptions}
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
  bottomPanel && (bottomPanel.size = 190);
});

export default SerializeViewApp;
