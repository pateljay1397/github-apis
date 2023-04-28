/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useCallback, useEffect } from "react";
import { Viewer, ViewerContentToolsProvider, ViewerNavigationToolsProvider, ViewerStatusbarItemsProvider } from "@itwin/web-viewer-react";
import { MeasureTools, MeasureToolsUiItemsProvider } from "@itwin/measure-tools-react";
import { PropertyGridManager, PropertyGridUiItemsProvider } from "@itwin/property-grid-react";
import { TreeWidget, TreeWidgetUiItemsProvider } from "@itwin/tree-widget-react";
import { authClient } from "./common/AuthorizationClient";
import { mapLayerOptions } from "./common/MapLayerOptions";
import { ViewSetup } from "./common/ViewSetup";

const viewportOptions = {
  viewState: ViewSetup.getDefaultView,
};
const uiProviders = [
  new ViewerContentToolsProvider(),
  new ViewerNavigationToolsProvider(),
  new ViewerStatusbarItemsProvider(),
  new MeasureToolsUiItemsProvider(),
  new PropertyGridUiItemsProvider(),
  new TreeWidgetUiItemsProvider(),
];

const iTwinId = process.env.IMJS_ITWIN_ID;
const iModelId = process.env.IMJS_IMODEL_ID;

const ViewportFrontstageApp = () => {

  /** Sign-in */
  useEffect(() => {
    void authClient.signIn();
  }, []);

  const onIModelAppInit = useCallback(async () => {
    await MeasureTools.startup();
    await PropertyGridManager.initialize();
    await TreeWidget.initialize();
  }, []);

  /** The sample's render method */
  return <Viewer
    iTwinId={iTwinId ?? ""}
    iModelId={iModelId ?? ""}
    authClient={authClient}
    viewportOptions={viewportOptions}
    mapLayerOptions={mapLayerOptions}
    enablePerformanceMonitors={false}
    onIModelAppInit={onIModelAppInit}
    uiProviders={uiProviders}
    theme="dark"
  />;
};

export default ViewportFrontstageApp;
