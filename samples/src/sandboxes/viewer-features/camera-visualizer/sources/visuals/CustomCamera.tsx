/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { Camera, ColorDef, Frustum } from "@itwin/core-common";
import { Angle, Matrix3d, Point3d, Transform, Vector3d } from "@itwin/core-geometry";
import { CameraManager } from "../CameraManager";

export class CustomCamera extends Camera {
  private _target: Point3d;
  private _color: ColorDef;
  private _isVisible: boolean;
  private _rotationalTheta = Angle.createDegrees(0);
  private _frustum: Frustum | undefined;
  private _name: string;

  constructor(eye: Point3d, target: Point3d, lensAngle: Angle, color: ColorDef, rotation: Angle, name: string) {
    super({
      eye,
      lens: lensAngle,
      focusDist: eye.distance(target),
    });
    this._target = target;
    this._color = color;
    this._isVisible = true;
    this._rotationalTheta = rotation;
    this._name = name;
  }

  // Return the transform that defines the orientation and location of the camera eye
  public getTransform(): Transform {

    const eyeVector = Vector3d.createFrom(this.eye);
    const targetVector = Vector3d.createFrom(this._target);

    // From eye to target
    const forwardVector = targetVector.minus(eyeVector);

    // Perp. to forward vector and unitZ vector
    const rightVector = forwardVector.crossProduct(Vector3d.unitZ());

    if (rightVector.magnitude() - 0.000001 <= 0) {
      // Camera is directly above target, breaking math
      const newEye = this.getEyePoint();
      newEye.addXYZInPlace(0.001, 0.001, 0);
      this.setEyePoint(newEye);
      return this.getTransform();
    }

    // Correct "up" vector
    const upVector = rightVector.crossProduct(forwardVector);

    // normalize for unit vectors
    forwardVector.normalizeInPlace();
    rightVector.normalizeInPlace();
    upVector.normalizeInPlace();

    // create transform
    const transform = Transform.createOriginAndMatrixColumns(this.eye, forwardVector, upVector, rightVector);

    // Rotation
    const theta = this._rotationalTheta.radians;
    const rot = Matrix3d.createRowValues(1, 0, 0, 0, Math.cos(theta), -Math.sin(theta), 0, Math.sin(theta), Math.cos(theta));

    const result = transform.multiplyTransformMatrix3d(rot);

    // return result
    if (result)
      return result;

    // if result is invalid, at least return non-rotated transform
    return transform;
  }

  public calculateFocusDistance() {
    return this.eye.distance(this._target);
  }

  public setFrustum(f: Frustum) {
    this._frustum = f;
  }

  public setTarget(t: Point3d) {
    this._target = t;
  }

  public setColor(c: ColorDef) {
    this._color = c;
  }

  public setRotationAngle(a: Angle) {
    if (a.radians > Math.PI || a.radians < -Math.PI)
      return;
    this._rotationalTheta = a;
  }

  public setName(name: string) {
    if (name === "") {
      name = `Camera ${  CameraManager.getActiveCameraIndex()+1}`;
    }
    this._name = name;
  }

  public setIsVisible(v: boolean) {
    this._isVisible = v;
  }

  public getTarget() {
    return this._target;
  }

  public getFrustum() {
    return this._frustum;
  }

  public getColor() {
    return this._color;
  }

  public getName() {
    return this._name;
  }

  public getRotationalAngle() {
    return this._rotationalTheta;
  }

  public isVisible() {
    return this._isVisible;
  }
}
