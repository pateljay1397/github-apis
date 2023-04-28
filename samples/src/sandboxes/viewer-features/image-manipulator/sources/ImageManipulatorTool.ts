/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { BeButtonEvent, EditManipulator, IModelApp, IModelConnection } from "@itwin/core-frontend";
import { AxisIndex, Point3d, Vector3d } from "@itwin/core-geometry";
import { ImageDecorator } from "./visuals/ImageDecorator";

/** Enumeration for the various decorations that can be clicked to trigger the tool */
export enum ImageManipulatorHandle {
  "top_right",
  "top_left",
  "bot_left",
  "bot_right",
  "translate",
  "push_pull",
  "rotZ",
  "rotY",
  "rotX"
}

export class ImageManipulatorTool extends EditManipulator.HandleTool {
  /** IModel Connection */
  private _iModel: IModelConnection;

  /** Main decorator that draws/controls image */
  private decorator: ImageDecorator;

  /** Defines which decoration was clicked (and thus how the image should be manipulated - ex. resize, rotate...) */
  private typeOfManipulation: ImageManipulatorHandle;

  /** Defines where the mouse used to be to calculate the change from its current position */
  private oldPoint: Point3d;

  /** Will be true when the image is resized and the origin must be recalulated */
  private originNeedsRecalc = false;

  /** Is true if the handle was clicked while shift key was being held -- locks it into shift mode for duration of tool use */
  private toolInitializedWhileHoldingShift;

  constructor(manipulator: EditManipulator.HandleProvider, iModel: IModelConnection, decorator: ImageDecorator, startingPoint: Point3d, cornerIndex: ImageManipulatorHandle, shift: boolean) {
    super(manipulator);

    this._iModel = iModel;
    this.decorator = decorator;
    this.typeOfManipulation = cornerIndex;
    this.oldPoint = startingPoint;
    this.toolInitializedWhileHoldingShift = shift;
  }

  /** Turn off accusnap -- it works unpredictably with the current implementation */
  protected get wantAccuSnap() {
    return false;
  }

  /** When the tool is active and the mouse is moving, capture that data and act on it */
  public async onMouseMotion(_ev: BeButtonEvent): Promise<void> {

    /** Initialize some useful variables */
    const camEye = IModelApp.viewManager.selectedView!.getFrustum().getEyePoint();
    const screenWidth = IModelApp.viewManager.selectedView!.getClientRect().width;
    const screenHeight = IModelApp.viewManager.selectedView!.getClientRect().height;

    /** Get the old values for origin and angle */
    const origin = this.decorator.getOrigin();
    const colY = this.decorator.getTransform().matrix.clone().columnY();
    const colZ = this.decorator.getTransform().matrix.clone().columnZ();

    const z = Vector3d.unitZ();
    /** Get the unitZ projection in order to calculate how to transform mouse inputs if image is rotated along Z axis */
    const unitZProjection = z.minus(colZ.scale((z.dotProduct(colZ.normalize()!))));

    /** How much the image is rotated on Z axis */
    const imageAngle = colY.signedAngleTo(unitZProjection, colZ);

    /** Distance from the camera's eye to the origin of the image - used to scale input */
    const camEyeToOrigin = camEye!.distance(origin);

    /** Calculate deltaX and deltaY using current point and old point (some scaling makes for a smoother experience) */
    const deltaX = -(_ev.viewPoint.x - this.oldPoint.x)*camEyeToOrigin/screenWidth*1.2;
    const deltaY = -(_ev.viewPoint.y - this.oldPoint.y)*camEyeToOrigin/screenHeight*1.2;

    /** Apply rotational transformation to ensure image resize / translation follows mouse */
    const transformedDeltaX = deltaX*Math.cos(imageAngle.radians) + deltaY*Math.sin(imageAngle.radians);
    const transformedDeltaY = deltaY*Math.cos(imageAngle.radians) - deltaX*Math.sin(imageAngle.radians);

    if (_ev.movement && _ev.viewport) {

      switch (this.typeOfManipulation) {
        case ImageManipulatorHandle.top_right:
          if (this.toolInitializedWhileHoldingShift || _ev.isShiftKey) {
            const aspectRatio = this.decorator.getAspectRatio();

            if (Math.abs(transformedDeltaX) > Math.abs(transformedDeltaY)) {
              this.decorator.addXYToCorner(0, transformedDeltaX, transformedDeltaX/aspectRatio);
              this.decorator.addXYToCorner(1, 0, transformedDeltaX/aspectRatio);
              this.decorator.addXYToCorner(3, transformedDeltaX, 0);
            } else {
              this.decorator.addXYToCorner(0, transformedDeltaY*aspectRatio, transformedDeltaY);
              this.decorator.addXYToCorner(1, 0, transformedDeltaY);
              this.decorator.addXYToCorner(3, transformedDeltaY*aspectRatio, 0);
            }
          } else { // Shift is not being held, don't worry about aspect ratio
            this.decorator.addXYToCorner(0, transformedDeltaX, transformedDeltaY);
            this.decorator.addXYToCorner(1, 0, transformedDeltaY);
            this.decorator.addXYToCorner(3, transformedDeltaX, 0);
          }

          this.originNeedsRecalc = true;
          break;

        case ImageManipulatorHandle.top_left:
          if (this.toolInitializedWhileHoldingShift || _ev.isShiftKey) {
            const aspectRatio = this.decorator.getAspectRatio();

            if (Math.abs(transformedDeltaX) > Math.abs(transformedDeltaY)) {
              this.decorator.addXYToCorner(1, transformedDeltaX, -transformedDeltaX/aspectRatio);
              this.decorator.addXYToCorner(0, 0, -transformedDeltaX/aspectRatio);
              this.decorator.addXYToCorner(2, transformedDeltaX, 0);
            } else {
              this.decorator.addXYToCorner(1, -transformedDeltaY*aspectRatio, transformedDeltaY);
              this.decorator.addXYToCorner(0, 0, transformedDeltaY);
              this.decorator.addXYToCorner(2, -transformedDeltaY*aspectRatio, 0);
            }

          } else {
            // Shift is not being held, don't worry about aspect ratio
            this.decorator.addXYToCorner(1, transformedDeltaX, transformedDeltaY);
            this.decorator.addXYToCorner(0, 0, transformedDeltaY);
            this.decorator.addXYToCorner(2, transformedDeltaX, 0);
          }

          this.originNeedsRecalc = true;
          break;

        case ImageManipulatorHandle.bot_left:
          if (this.toolInitializedWhileHoldingShift || _ev.isShiftKey) {
            const aspectRatio = this.decorator.getAspectRatio();

            if (Math.abs(transformedDeltaX) > Math.abs(transformedDeltaY)) {
              this.decorator.addXYToCorner(2, transformedDeltaX, transformedDeltaX/aspectRatio);
              this.decorator.addXYToCorner(3, 0, transformedDeltaX/aspectRatio);
              this.decorator.addXYToCorner(1, transformedDeltaX, 0);
            } else {
              this.decorator.addXYToCorner(2, transformedDeltaY*aspectRatio, transformedDeltaY);
              this.decorator.addXYToCorner(3, 0, transformedDeltaY);
              this.decorator.addXYToCorner(1, transformedDeltaY*aspectRatio, 0);
            }

          } else {
            // Shift is not being held, don't worry about aspect ratio
            this.decorator.addXYToCorner(2, transformedDeltaX, transformedDeltaY);
            this.decorator.addXYToCorner(3, 0, transformedDeltaY);
            this.decorator.addXYToCorner(1, transformedDeltaX, 0);
          }

          this.originNeedsRecalc = true;
          break;

        case ImageManipulatorHandle.bot_right:
          if (this.toolInitializedWhileHoldingShift || _ev.isShiftKey) {
            const aspectRatio = this.decorator.getAspectRatio();

            if (Math.abs(transformedDeltaX) > Math.abs(transformedDeltaY)) {
              this.decorator.addXYToCorner(3, transformedDeltaX, -transformedDeltaX/aspectRatio);
              this.decorator.addXYToCorner(2, 0, -transformedDeltaX/aspectRatio);
              this.decorator.addXYToCorner(0, transformedDeltaX, 0);
            } else {
              this.decorator.addXYToCorner(3, -transformedDeltaY*aspectRatio, transformedDeltaY);
              this.decorator.addXYToCorner(2, 0, transformedDeltaY);
              this.decorator.addXYToCorner(0, -transformedDeltaY*aspectRatio, 0);
            }

          } else {
            // Shift is not being held, don't worry about aspect ratio
            this.decorator.addXYToCorner(3, transformedDeltaX, transformedDeltaY);
            this.decorator.addXYToCorner(2, 0, transformedDeltaY);
            this.decorator.addXYToCorner(0, transformedDeltaX, 0);
          }

          this.originNeedsRecalc = true;
          break;

        case ImageManipulatorHandle.translate:
          this.decorator.addXYToOrigin(transformedDeltaX, transformedDeltaY);
          break;

        case ImageManipulatorHandle.push_pull:
          this.decorator.addZToOrigin(-deltaY);
          break;

        case ImageManipulatorHandle.rotZ:
          const rotAngle = this.calculateRotationAngle(_ev, screenWidth, screenHeight);
          this.decorator.rotateByAngleAroundAxis(rotAngle, AxisIndex.Z);
          break;

        case ImageManipulatorHandle.rotY:
          const turnAngle = this.calculateRotationAngle(_ev, screenWidth, screenHeight);
          this.decorator.rotateByAngleAroundAxis(turnAngle, AxisIndex.Y);
          break;

        case ImageManipulatorHandle.rotX:
          const tiltAngle = this.calculateRotationAngle(_ev, screenWidth, screenHeight);
          this.decorator.rotateByAngleAroundAxis(tiltAngle, AxisIndex.X);
          break;

      }
      this.oldPoint = _ev.viewPoint;

      IModelApp.viewManager.invalidateDecorationsAllViews();
    }

  }

  /** Calculate the angle that the mouse makes to a horizontal line in the middle of the screen */
  private calculateRotationAngle(_ev: BeButtonEvent, screenWidth: number, screenHeight: number) {
    const mouseScreenPositionVector = Vector3d.create(_ev.viewPoint.x/screenWidth*100-50, -(_ev.viewPoint.y/screenHeight*100-50));
    mouseScreenPositionVector.normalizeInPlace();

    let angleToRotate;
    if (mouseScreenPositionVector.y > 0)
      angleToRotate = mouseScreenPositionVector.angleTo(Vector3d.unitX());
    else {
      angleToRotate = mouseScreenPositionVector.angleTo(Vector3d.unitX(-1));
      angleToRotate.setDegrees(angleToRotate.degrees+180);
    }

    angleToRotate.setDegrees(-angleToRotate.degrees);

    if (this.toolInitializedWhileHoldingShift || _ev.isShiftKey) {
      angleToRotate.setDegrees(Math.round(angleToRotate.degrees/45)*45);
    }

    return angleToRotate;
  }

  /** Called when tool is "finished" (data mouse button pressed/released) */
  protected accept(_ev: BeButtonEvent): boolean {
    if (this.originNeedsRecalc)
      this.decorator.recalculateOrigin();
    return true;
  }

}
