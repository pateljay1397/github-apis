/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { BeEvent } from "@itwin/core-bentley";
import { ColorDef } from "@itwin/core-common";
import { IModelApp } from "@itwin/core-frontend";
import { Angle, Point3d } from "@itwin/core-geometry";
import { CustomCamera } from "./visuals/CustomCamera";

export const LENS_ANGLE_MINIMUM = 5;
export const LENS_ANGLE_MAXIMUM = 155;
export const EYE_INITIAL = new Point3d(3, -5, 4);
export const TARGET_INITIAL = new Point3d(10, 0, 0);
export const MAX_CAMERA_NUMBER = 8;

export class CameraManager {

  private static _activeCameraIndex: number = 0;
  private static _cameraList: CustomCamera[] = [new CustomCamera(EYE_INITIAL, TARGET_INITIAL, Angle.createDegrees(60), ColorDef.red, Angle.createDegrees(0), "Camera 1")];
  private static _lifetimeCamCnt = 1;

  private static _changeOccurred() {
    this.onChangeOccur.raiseEvent(this._cameraList, this._activeCameraIndex);
    IModelApp.viewManager.invalidateDecorationsAllViews();

  }

  public static onChangeOccur = new BeEvent<(cameraList: CustomCamera[], activeCameraIndex: number) => void>();

  // Get
  public static getActiveCamera() {
    return this._cameraList[this._activeCameraIndex];
  }

  public static getCameraList() {
    return this._cameraList;
  }

  public static getActiveCameraIndex() {
    return this._activeCameraIndex;
  }

  public static getColorAtIndex(index: number) {
    return this._cameraList[index].getColor();
  }

  public static getNameAtIndex(index: number) {
    return this._cameraList[index].getName();
  }

  public static getIsVisibleAtIndex(index: number) {
    return this._cameraList[index].isVisible;
  }

  // Set
  public static setActiveCameraIndex(index: number) {
    if (index >= 0 && index < this._cameraList.length) {
      this._activeCameraIndex = index;
      this._changeOccurred();
    }
  }

  public static setNameAtIndex(index: number, name: string) {
    this._cameraList[index].setName(name);
  }

  // Modify
  public static addCameraToList(color: ColorDef) {
    this._lifetimeCamCnt++;
    const active = this.getActiveCamera();
    const newCam = new CustomCamera(active.getEyePoint().clone(), active.getTarget().clone(), active.getLensAngle().clone(), color, active.getRotationalAngle().clone(), `Camera ${  this._lifetimeCamCnt}`);
    this._cameraList.push(newCam);
    this._changeOccurred();
  }

  public static removeCameraFromList(index: number) {
    if (index > -1 && index < this._cameraList.length) {
      this._cameraList.splice(index, 1);
      this._changeOccurred();
    }
  }

  public static editColorAtIndex(index: number, newColor: ColorDef) {
    if (index > -1 && index < this._cameraList.length) {
      this._cameraList[index].setColor(newColor);
    }
  }

  public static toggleVisibility(indexToToggle: number) {
    if (indexToToggle > -1 && indexToToggle < this._cameraList.length) {
      this._cameraList[indexToToggle].setIsVisible(!this._cameraList[indexToToggle].isVisible());
    }
  }

}
