/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { Viewer, ViewerFrontstage } from "@itwin/web-viewer-react";
import { authClient } from "./common/AuthorizationClient";
import { mapLayerOptions } from "./common/MapLayerOptions";
import { ViewSetup } from "./common/ViewSetup";
import { FrontstageSwapperToolbarProvider } from "./FrontstageSwapperToolbarProvider";
import { FrontstageManager, ModalDialogManager, StandardContentToolsProvider, StandardFrontstageProvider, StandardNavigationToolsProvider, StandardStatusbarItemsProvider } from "@itwin/appui-react";
import { InstructionsFrontstageProps } from "./frontstages/InstructionsFrontstage";
import { ModalWithMessage } from "./ModalWithMessage";
import { DefaultFrontstageProps } from "./frontstages/DefaultFrontstage";
import { TwoViewportsFrontstageProps } from "./frontstages/TwoViewportsFrontstage";
import { ViewAttributesFrontstageProps } from "./frontstages/ViewAttributesFrontstage";
import { ViewAttributesWidgetProvider } from "./view-attributes/ViewAttributesWidget";

// Define your frontstages
const frontstages: ViewerFrontstage[] = [
  {
    provider: new StandardFrontstageProvider(InstructionsFrontstageProps),
    default: true,
    requiresIModelConnection: true,
  },
  {
    provider: new StandardFrontstageProvider(DefaultFrontstageProps),
    default: false,
    requiresIModelConnection: true,
  },
  {
    provider: new StandardFrontstageProvider(TwoViewportsFrontstageProps),
    default: false,
    requiresIModelConnection: true,
  },
  {
    provider: new StandardFrontstageProvider(ViewAttributesFrontstageProps),
    default: false,
    requiresIModelConnection: false,
  },
];

// Define UiItemsProviders to populate the "empty" frontstage(s)
const uiProviders = [
  // The toolbar that allows switching between different frontstages. Present on every frontstage.
  new FrontstageSwapperToolbarProvider(),
  new ViewAttributesWidgetProvider(),
];

// On initialization of the app, register standard UI pieces to appear on the Default Frontstage
const _onIModelAppInit = async () => {
  /** Provides a set of standard tools for Content (in the top left corner) */
  StandardContentToolsProvider.register("sandbox:defaultContentTools", {
    horizontal: {
      clearSelection: true,
      clearDisplayOverrides: true,
      hide: "group",
      isolate: "group",
      emphasize: "element",
    },
  }, (stageId: string, _stageUsage: string, _applicationData: any) => {
    return stageId === "sandbox:default-frontstage";
  });

  /** Provides standard tools for Navigation (in the top right corner) */
  StandardNavigationToolsProvider.register("sandbox:defaultNavigationTools", undefined, (stageId: string, _stageUsage: string, _applicationData: any) => {
    return stageId === "sandbox:default-frontstage";
  });

  /** Provides standard status fields to Statusbar (at the bottom of the Viewer) */
  StandardStatusbarItemsProvider.register("sandbox:defaultStatusFields", undefined, (stageId: string, _stageUsage: string, _applicationData: any) => {
    return stageId === "sandbox:default-frontstage";
  });
};

const viewportOptions = {
  viewState: ViewSetup.getDefaultView,
};

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
    frontstages={frontstages}
    uiProviders={uiProviders}
    onIModelAppInit={_onIModelAppInit}
    enablePerformanceMonitors={false}
    theme="dark"
  />;
};

FrontstageManager.onFrontstageReadyEvent.addListener((event) => {
  const { id, bottomPanel } = event.frontstageDef;
  // Display a unique pop-up for each frontstage
  if (id === "sandbox:instructions-frontstage") {
    ModalDialogManager.openDialog(
      <ModalWithMessage
        title="Frontstage Introduction"
        message={
          ["This sample serves as a basic introduction to frontstages.",
            "It contains four miscellaneous frontstage examples.",
            "Close this dialog and use the button in the top left corner to switch between each frontstage.",
          ].join(" ")
        }
      />);
  }
  if (id === "sandbox:default-frontstage") {
    ModalDialogManager.openDialog(
      <ModalWithMessage
        title="Default Frontstage"
        message={
          ["This frontstage is meant to showcase how to provide default tools and status bar.",
            "The tool settings and navigation cube are also not hidden in this frontstage.",
          ].join(" ")
        }
      />);
  }
  if (id === "sandbox:two-viewports-frontstage") {
    ModalDialogManager.openDialog(
      <ModalWithMessage
        title="Two Viewport Frontstage"
        message={
          ["This frontstage is meant to showcase how the frontstage can provide multiple viewports.",
            "Additionally, the initial view state can be customized when the frontstage opens",
            "(notice that the bottom viewport has a different initial viewstate than the top).",
          ].join(" ")
        }
      />);
  }
  if (id === "sandbox:view-attributes-frontstage") {
    // Define panel size
    bottomPanel && (bottomPanel.size = 270);
    // Open the explanation pop-up
    ModalDialogManager.openDialog(
      <ModalWithMessage
        title="View Attributes Frontstage"
        message={
          [
            "This frontstage is meant to showcase that we can encapsulate",
            "the same logic as our samples within custom frontstages that can be swapped to.",
            "Specifically, this Frontstage shows the exact same behavior as the existing \"View Attributes\" sample.",
          ].join(" ")
        }
      />);
  }
});

export default ViewportFrontstageApp;
