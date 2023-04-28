/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { IModelConnection, StandardViewId, ViewCreator3d } from "@itwin/core-frontend";
import { Point3d, Vector3d } from "@itwin/core-geometry";
import { authClient } from "./common/AuthorizationClient";
import { Viewer } from "@itwin/web-viewer-react";

// eyePoint and targetPoint(Arc's midPoint) are static.
const points = {
  eyePoint: Point3d.fromJSON({ x: 32674.888815502116, y: 31913.053213466133, z: 36.52732354137845 }),
  targetPoint: Point3d.fromJSON({ x: 32674.012826292135, y: 31912.64191462393, z: 36.27537877282909 }),
};

const viewportOptions = {
  viewState: async (iModel: IModelConnection) => {
    const viewState = await new ViewCreator3d(iModel).createDefaultView({
      skyboxOn: true,
      standardViewId: StandardViewId.Top,
    });
    viewState.viewFlags = viewState.viewFlags.with("acsTriad", false);

    // Added the DefaultView from one of the sections in viewportOptions
    if (viewState.is3d()) {
      viewState.lookAt({ eyePoint: points.eyePoint, targetPoint: points.targetPoint, upVector: new Vector3d(0, 0, 1), lensAngle: viewState.camera.lens });
    }
    return viewState;
  },
};

const iTwinId = process.env.IMJS_ITWIN_ID;
const iModelId = process.env.IMJS_IMODEL_ID;

export const StadiumViewer = ({ onIModelConnected }: { onIModelConnected: () => void }) => {
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

