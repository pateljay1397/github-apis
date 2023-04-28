/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { Viewer } from "@itwin/web-viewer-react";
import { authClient } from "./common/AuthorizationClient";
import { mapLayerOptions } from "./common/MapLayerOptions";
import { ViewSetup } from "./common/ViewSetup";
import { SwipingComparisonWidgetProvider } from "./SwipingComparisonWidget";

const containerId = "swiping_comparison_app_container";
const uiProviders = [new SwipingComparisonWidgetProvider(containerId)];
const viewportOptions = {
  viewState: ViewSetup.getDefaultView,
};

const iTwinId = process.env.IMJS_ITWIN_ID;
const iModelId = process.env.IMJS_IMODEL_ID;

const SwipingComparisonApp = () => {
  /** Sign-in */
  useEffect(() => {
    void authClient.signIn();
  }, []);

  /** The sample's render method */
  return (
    <div id={containerId} className="sample-app-container">
      <Viewer
        iTwinId={iTwinId ?? ""}
        iModelId={iModelId ?? ""}
        authClient={authClient}
        viewportOptions={viewportOptions}
        mapLayerOptions={mapLayerOptions}
        uiProviders={uiProviders}
        defaultUiConfig={
          {
            hideStatusBar: true,
            hideToolSettings: true,
          }
        }
        enablePerformanceMonitors={false}
        theme="dark"
      />
    </div>
  );
};

export default SwipingComparisonApp;
