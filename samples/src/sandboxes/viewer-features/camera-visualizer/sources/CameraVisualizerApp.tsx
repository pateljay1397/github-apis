/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { useCallback, useEffect, useState } from "react";
import { FrontstageManager } from "@itwin/appui-react";
import { IModelApp, IModelConnection } from "@itwin/core-frontend";
import { Viewer, ViewerFrontstage } from "@itwin/web-viewer-react";
import { authClient } from "./common/AuthorizationClient";
import { ViewSetup } from "./common/ViewSetup";
import { MultiViewportFrontstage } from "./sample-code/MultiViewportFrontstageProvider";
import { CameraDecorator } from "./visuals/CameraDecorator";
import { Angle, Vector3d } from "@itwin/core-geometry";
import HideCategories from "./sample-code/HideCategories";
import { CameraManagerWidgetProvider } from "./widget/CameraWidget";
import { EYE_INITIAL, TARGET_INITIAL } from "./CameraManager";

const uiProviders = [new CameraManagerWidgetProvider()];

const iTwinId = process.env.IMJS_ITWIN_ID;
const iModelId = process.env.IMJS_IMODEL_ID;

const CameraViewerApp = () => {
  const [frontStages, setFrontstages] = useState<ViewerFrontstage[]>([]);

  const onIModelConnected = useCallback(async (conn: IModelConnection) => {

    /** Set up the fronstage */
    if (frontStages.length === 0) {
      const viewState = await getInitialViewState(conn);
      setFrontstages(() => [{ provider: new MultiViewportFrontstage(viewState), default: true }]);
    }
    /** Set first viewport up */
    IModelApp.viewManager.onViewOpen.addOnce(async (vp) => {

      /** Add Decorator */
      const myDec = new CameraDecorator(conn);
      IModelApp.viewManager.addDecorator(myDec);

      vp.turnCameraOn(Angle.createDegrees(60));
    });

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
    viewportOptions={{ viewState: getInitialViewState }}
    uiProviders={uiProviders}
    onIModelConnected={onIModelConnected}
    defaultUiConfig={
      {
        hideNavigationAid: true,
        hideStatusBar: true,
        hideToolSettings: true,
      }
    }
    enablePerformanceMonitors={false}
    theme="dark"
  />;
};

/** Returns the initial viewstate */
const getInitialViewState = async (conn: IModelConnection) => {
  const viewState = await ViewSetup.getDefaultView(conn);

  /** Hide the top and exterior levels of the house iModel */
  await HideCategories.overrideView(conn, viewState);

  /** Change first viewport's initial view */
  const firstVP = IModelApp.viewManager.getFirstOpenView();
  if (firstVP && firstVP.view.isSpatialView()) {
    firstVP.view.lookAt({
      eyePoint: EYE_INITIAL,
      upVector: Vector3d.unitZ(),
      targetPoint: TARGET_INITIAL,
      lensAngle: Angle.createDegrees(60),
    });

    firstVP.synchWithView({ animateFrustumChange: true });
  }

  return viewState;
};

// Define panel size
FrontstageManager.onFrontstageReadyEvent.addListener((event) => {
  const { bottomPanel } = event.frontstageDef;
  bottomPanel && (bottomPanel.size = 275);

});

export default CameraViewerApp;
