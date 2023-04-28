/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { Viewer, ViewerFrontstage } from "@itwin/web-viewer-react";
import { authClient } from "./common/AuthorizationClient";
import { mapLayerOptions } from "./common/MapLayerOptions";
import { ViewSetup } from "./common/ViewSetup";
import { FrontstageManager, FrontstageReadyEventArgs, ModalDialogManager, StandardFrontstageProvider } from "@itwin/appui-react";
import { CustomStatusbarFrontstageProps } from "./CustomStatusbarFrontstage";
import { ModalWithMessage } from "./ModalWithMessage";
import { CustomStatusbarProvider } from "./CustomStatusbarProvider";

const viewportOptions = {
  viewState: ViewSetup.getDefaultView,
};

// Define your frontstages
const frontstages: ViewerFrontstage[] = [
  {
    provider: new StandardFrontstageProvider(CustomStatusbarFrontstageProps),
    default: true,
    requiresIModelConnection: true,
  },
];

// Define UiItemsProvider(s) to populate the "empty" frontstage
const uiProviders = [
  new CustomStatusbarProvider(),
];

const iTwinId = process.env.IMJS_ITWIN_ID;
const iModelId = process.env.IMJS_IMODEL_ID;

const ViewportFrontstageApp = () => {

  /** Sign-in */
  useEffect(() => {
    void authClient.signIn();
  }, []);

  /** The sample's render method */
  return <Viewer
    iTwinId={iTwinId ?? ""}
    iModelId={iModelId ?? ""}
    authClient={authClient}
    viewportOptions={viewportOptions}
    mapLayerOptions={mapLayerOptions}
    enablePerformanceMonitors={false}
    frontstages={frontstages}
    uiProviders={uiProviders}
    theme="dark"
  />;
};

FrontstageManager.onFrontstageReadyEvent.addListener((event: FrontstageReadyEventArgs) => {
  const { id } = event.frontstageDef;
  // Pop-up modal when frontstage is ready
  if (id === "sandbox:custom-status-bar-frontstage") {
    ModalDialogManager.openDialog(
      <ModalWithMessage
        title="Status Bar"
        message={
          ["This Frontstage contains a custom defined status bar (at the bottom of the frame).",
            "Try out how each section of the status bar works and checkout the code in CustomStatusbarProvider.tsx for details on how to define your own.",
          ].join(" ")
        }
      />);
  }
});

export default ViewportFrontstageApp;

