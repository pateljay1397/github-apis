/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { IModelApp, IModelConnection } from "@itwin/core-frontend";
import { Viewer, ViewerNavigationToolsProvider } from "@itwin/web-viewer-react";
import React, { useEffect } from "react";
import { authClient } from "./common/AuthorizationClient";
import { ViewSetup } from "./common/ViewSetup";
import { ImageManipulatorApi } from "./ImageManipulatorApi";
import ExtonFront1 from "./public/ExtonFront1.jpg";
import ExtonSide1 from "./public/ExtonSide1.jpg";
import { ImageHandleProvider } from "./visuals/ImageHandleProvider";
import { SimpleWidgetProvider } from "./widget/ImageManipulatorWidget";

const viewportOptions = {
  viewState: ViewSetup.getDefaultView,
};

const iTwinId = process.env.IMJS_ITWIN_ID;
const iModelId = process.env.IMJS_IMODEL_ID;

const uiProviders = [
  new SimpleWidgetProvider(),
  new ViewerNavigationToolsProvider(),
];

const onIModelConnected = (iModel: IModelConnection) => {
  const imgs = [
    ExtonFront1,
    ExtonSide1,
  ];

  const myProvider = new ImageHandleProvider(iModel);

  IModelApp.viewManager.onViewOpen.addOnce(async (vp) => {

    /** Add Decorator */
    const myDecorator = await ImageManipulatorApi.createDecorator(iModel, imgs, { x: 18.25, y: 13.688 });
    IModelApp.viewManager.addDecorator(myDecorator);

    /** Send decorator to provider */
    myProvider.setDecorator(myDecorator);

    /** Turn camera on */
    vp.turnCameraOn();

    /** Look at the first image */
    ImageManipulatorApi.lookAtImage();
  });
};

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
    onIModelConnected={onIModelConnected}
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

export default ViewportFrontstageApp;
