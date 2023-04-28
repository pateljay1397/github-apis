/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { BeButton, BeButtonEvent, DecorateContext, Decorator, EventHandled, HitDetail, IModelApp, IModelConnection, ScreenViewport } from "@itwin/core-frontend";
import { Angle, Point3d, Transform } from "@itwin/core-geometry";
import { CameraGraphics, CameraGraphicsProps } from "./CameraGraphics";
import { CameraManager } from "../CameraManager";

export class CameraDecorator implements Decorator {

  /** Set to true when decorations can start being added */
  private _viewIsSetUp: boolean = false;

  /** Causes first viewport to use active camera's eyepoint and target to set the view --- can either snap immediately or animate */
  private _lookAtFunc: ((shouldAnimate?: boolean, newTarget?: Point3d) => void) = ()=>{};

  /** Holds the first viewport for comparison purposes */
  private _firstVP: ScreenViewport | undefined;

  /** Last known values of important state info, used to trigger updates */
  private _currentActiveCamIndex: number = 0;
  private _currentActiveCamLensAngleDegrees = 60;
  private _currentActiveCamRotationDegrees= 0;

  /** Maps generated decoration IDs with strings below */
  private _decorationIDMap = new Map<string, string>([]);

  private _listOfIDs = [
    "cam_trans_x_pos",
    "cam_trans_x_neg",
    "cam_trans_y_pos",
    "cam_trans_y_neg",
    "cam_trans_z_pos",
    "cam_trans_z_neg",
    "targ_trans_x_pos",
    "targ_trans_x_neg",
    "targ_trans_y_pos",
    "targ_trans_y_neg",
    "targ_trans_z_pos",
    "targ_trans_z_neg",
  ];

  constructor(conn: IModelConnection) {
    /** Decoration ids are used for selecting the translational cones */
    this._generateDecorationIDs(conn);
  }

  /** Initializes the firstVP variable and the lookAt function */
  private initialize() {

    this._firstVP = IModelApp.viewManager.getFirstOpenView()!;

    this._lookAtFunc = (shouldAnimate: boolean = true, newTarget: Point3d = CameraManager.getActiveCamera().getTarget()) => {
      if (this._firstVP && this._firstVP.view.isSpatialView()) {
        this._firstVP.view.lookAt({
          eyePoint: CameraManager.getActiveCamera().getEyePoint(),
          upVector: this.getUpVector(),
          targetPoint: newTarget,
          lensAngle: CameraManager.getActiveCamera().getLensAngle(),
        });

        this._firstVP.synchWithView({ animateFrustumChange: shouldAnimate });
      }
    };

    // Everything is now set up
    this._viewIsSetUp = true;
  }

  public decorate(context: DecorateContext) {
    // Ensure everything is setup before decorating
    if (!this._viewIsSetUp || !this._firstVP) {
      this.initialize();
      return;
    }

    // Programatically add colored bars
    const firstVPOverlay = document.getElementsByClassName("uifw-contentlayout-overlay-div")[0];
    if (!firstVPOverlay.className.includes("firstViewport"))
      firstVPOverlay.className += " firstViewport";

    // Trigger "lookAtFunc" if anything needs updating
    if (this._currentActiveCamIndex !== CameraManager.getActiveCameraIndex()) {
      this._lookAtFunc(false);
      this._currentActiveCamIndex = CameraManager.getActiveCameraIndex();
    }

    if (this._currentActiveCamLensAngleDegrees !== CameraManager.getActiveCamera().getLensAngle().degrees) {
      this._lookAtFunc(false);
      this._currentActiveCamLensAngleDegrees = CameraManager.getActiveCamera().getLensAngle().degrees;
    }

    if (this._currentActiveCamRotationDegrees !== CameraManager.getActiveCamera().getRotationalAngle().degrees) {
      this._lookAtFunc(false);
      this._currentActiveCamRotationDegrees = CameraManager.getActiveCamera().getRotationalAngle().degrees;
    }

    if (this._firstVP.view.isSpatialView() && Math.round(this._currentActiveCamLensAngleDegrees) !== Math.round(this._firstVP.view.camera.getLensAngle().degrees)) {
      this._firstVP.view.camera.setLensAngle(Angle.createDegrees(this._currentActiveCamLensAngleDegrees));
    }

    // Get reference to active camera
    const activeCam = CameraManager.getActiveCamera();

    // Store the frustum of the first VP in the active camera, and if different, handle redraw of decoration
    const activeCamFrustum = activeCam.getFrustum();
    const firstVPFrustum = this._firstVP.getFrustum();
    const needsInvalidate = activeCamFrustum && !firstVPFrustum.equals(activeCamFrustum);
    activeCam.setFrustum(firstVPFrustum);

    // Iterate through cameras and draw components if visible or active
    for (const cam of CameraManager.getCameraList()) {
      // If the camera isn't visible, don't draw anything for it
      if (!cam.isVisible() && cam !== activeCam)
        continue;

      // Use DrawingProps for simplicity in DrawingHelper function calls
      const drawProps = {
        context,
        camera: cam,
        decorationIDMap: this._decorationIDMap,
      };

      // Draw Target point for both viewports
      CameraGraphics.drawTarget(drawProps);

      // Decorations for individual Viewports
      if (context.viewport.viewportId === this._firstVP.viewportId) {
        // nothing needs to be only drawn in first viewport
      } else {
        this.decorateSecondViewport(drawProps, cam === activeCam);
      }
    }

    // Allow for bidirectional viewing --
    // Changes in first viewport will be tracked and reflected in second
    if (this._viewIsSetUp) {
      activeCam.setTarget(this._firstVP.view.getTargetPoint());
      activeCam.setEyePoint(this._firstVP.getFrustum().getEyePoint()!);
    }

    if (needsInvalidate)
      this.invalidate();

  }

  private decorateSecondViewport(props: CameraGraphicsProps, camIsActive: boolean) {
    // FOV
    CameraGraphics.drawFOV(props);

    // Camera Sphere
    CameraGraphics.drawCameraSphere(props);

    // Only draw cones for active camera
    if (camIsActive) {
      // Camera and Target Transfomation Cones
      CameraGraphics.drawTranslationCones(props);
    }
  }

  /** Check if decorationID is part of map. Required for onDecorationButtonEvent */
  public testDecorationHit(_id: string) {
    let isValid = false;

    for (const mapID of this._decorationIDMap.values()) {
      if (mapID === _id)
        isValid = true;
    }

    return isValid;
  }

  /** Invalidates decorations so that second viewport more smoothly updates to track changes */
  private invalidate = () => {
    for (const view of IModelApp.viewManager) {
      if (view.viewportId === this._firstVP?.viewportId) {
        IModelApp.viewManager.invalidateDecorationsAllViews();
      }
    }
  };

  /** Remove blank tooltips on decoration hover */
  public async getDecorationToolTip(_hit: HitDetail) {
    const toolTip: Promise<string> = new Promise(function (resolve, _reject) {
      resolve("");
    });

    return toolTip;
  }

  /** Handle the clicks on the translation cones */
  public async onDecorationButtonEvent(hit: HitDetail, ev: BeButtonEvent) {
    if (ev.button === BeButton.Data) {
      this.handleTranslation(hit.sourceId);
      return EventHandled.Yes;
    }
    return EventHandled.No;
  }

  /** Translate either the camera or the target by dx, dy, dz Uses camera eye transform or camera and standard X, Y, Z axes for target */
  private translateObject(dx: number, dy: number, dz: number, isCam: boolean) {
    const activeCam = CameraManager.getActiveCamera();
    const transform = activeCam.getTransform();
    const target = Transform.createTranslation(activeCam.getTarget());
    const newTargetPoint = target.getOrigin();

    // Set eye or target accordingly
    if (isCam)
      activeCam.setEyePoint(transform.multiplyXYZ(dx, dy, dz));
    else
      target.multiplyXYZ(dx, dy, dz, newTargetPoint);

    // Update view with animation
    this._lookAtFunc(true, newTargetPoint);

  }

  private handleTranslation(id: string) {
    // How much each translation cone should move the object
    const translationDelta = .3333;

    switch (id) {
      case this._decorationIDMap.get("cam_trans_x_pos"):
        this.translateObject(translationDelta, 0, 0, true);
        break;

      case this._decorationIDMap.get("cam_trans_x_neg"):
        this.translateObject(translationDelta*-1, 0, 0, true);
        break;

      case this._decorationIDMap.get("cam_trans_y_pos"):
        this.translateObject(0, translationDelta, 0, true);
        break;

      case this._decorationIDMap.get("cam_trans_y_neg"):
        this.translateObject(0, translationDelta*-1, 0, true);
        break;

      case this._decorationIDMap.get("cam_trans_z_pos"):
        this.translateObject(0, 0, translationDelta, true);
        break;

      case this._decorationIDMap.get("cam_trans_z_neg"):
        this.translateObject(0, 0, translationDelta*-1, true);
        break;

      case this._decorationIDMap.get("targ_trans_x_pos"):
        this.translateObject(translationDelta, 0, 0, false);
        break;

      case this._decorationIDMap.get("targ_trans_x_neg"):
        this.translateObject(translationDelta*-1, 0, 0, false);
        break;

      case this._decorationIDMap.get("targ_trans_y_pos"):
        this.translateObject(0, translationDelta, 0, false);
        break;

      case this._decorationIDMap.get("targ_trans_y_neg"):
        this.translateObject(0, translationDelta*-1, 0, false);
        break;

      case this._decorationIDMap.get("targ_trans_z_pos"):
        this.translateObject(0, 0, translationDelta, false);
        break;

      case this._decorationIDMap.get("targ_trans_z_neg"):
        this.translateObject(0, 0, translationDelta*-1, false);
        break;
    }
  }

  /** Generate unique IDs for clickable decorations */
  private _generateDecorationIDs = (conn: IModelConnection) => {
    for (const id of this._listOfIDs)
      this._decorationIDMap.set(id, conn.transientIds.next);
  };

  /** Used for rotating view in first viewport when lookAt function is called */
  public getUpVector() {
    const transform = CameraManager.getActiveCamera().getTransform();

    const upVector = transform.matrix.columnY();

    return upVector;
  }
}
