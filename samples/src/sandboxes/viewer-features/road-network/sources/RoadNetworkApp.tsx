/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { Viewer, ViewerViewportControlOptions } from "@itwin/web-viewer-react";
import { FrontstageManager } from "@itwin/appui-react";
import { UiItemsProvider } from "@itwin/appui-abstract";
import { IModelApp } from "@itwin/core-frontend";
import { RoadDecorationWidgetProvider } from "./RoadDecorationWidget";
import RoadDecorationApi from "./RoadDecorationApi";
import { authClient } from "./common/AuthorizationClient";
import { mapLayerOptions } from "./common/MapLayerOptions";

const uiProviders: UiItemsProvider[] = [new RoadDecorationWidgetProvider()];
const viewportOptions: ViewerViewportControlOptions = {
  viewState: async (iModelConnection) => {
    const notice = `
      <div class="logo-card-notice">
      <span>
        This sample uses data from <a target="_blank" href="https://www.openstreetmap.org/">OpenStreetMap</a>.
        The data retrieved from this API is made available under the <a target="_blank" href="https://www.openstreetmap.org/copyright">Open Database License</a>.
      </span>
      </br>
      <span>
        © OpenStreetMap contributors
      </span>
      </div>
    `;
    IModelApp.applicationLogoCard = () => IModelApp.makeLogoCard({ heading: "Street Network Decorator", notice });
    return RoadDecorationApi.getInitialView(iModelConnection);
  },
};

const iTwinId = process.env.IMJS_ITWIN_ID;
const iModelId = process.env.IMJS_IMODEL_ID;

const RoadNetworkApp = () => {
  /** Sign-in */
  useEffect(() => {
    void authClient.signIn();
  }, []);

  /** The sample's render method */
  return (
    <Viewer
      iTwinId={iTwinId ?? ""}
      iModelId={iModelId ?? ""}
      authClient={authClient}
      viewportOptions={viewportOptions}
      mapLayerOptions={mapLayerOptions}
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
    />
  );
};

// Define panel size
FrontstageManager.onFrontstageReadyEvent.addListener((event) => {
  const { bottomPanel } = event.frontstageDef;
  bottomPanel && (bottomPanel.size = 275);
  bottomPanel && (bottomPanel.size = 290);
});

export default RoadNetworkApp;
