/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Viewport } from "@itwin/core-frontend";
import { Vector3d } from "@itwin/core-geometry";

/**
 * iModeljs contains a TwoWayViewportSync that works well when the iModel id's of the elements align. Because
 * this transformed iModel has entirely new id's, it doesn't work. This solution is simple to sync camera position's
 * together. This is a feature requested in future iModeljs versions.
 */
export class TwoWayViewportSync {
  private readonly _disconnect: VoidFunction[] = [];
  private _isEcho = false;

  // START CAMERA_POSITION
  private changeCameraPositionAndTarget(view1: Viewport, view2: Viewport) {
    if (this._isEcho) return;
    this._isEcho = true; // so we don't react to the echo of this sync

    // Grab information on view1's camera position
    if (view1.view.is3d()) {
      const EyePoint = view1.view.camera.getEyePoint();
      const targetPoint = view1.view.getTargetPoint();
      const frontDistance = view1.view.getFrontDistance();
      const backDistance = view1.view.getBackDistance();

      // Set the Second viewports camera to this position
      if (view2.view.is3d()) {
        view2.view.lookAt({
          eyePoint: EyePoint,
          targetPoint, upVector:
            new Vector3d(0, 0, 1),
          lensAngle: view1.view.camera.lens,
          frontDistance,
          backDistance,
        });
      }

      view2.invalidateRenderPlan();
      view2.synchWithView({ noSaveInUndo: true });
    }

    this._isEcho = false;
  }
  // END CAMERA_POSITION

  // START CONNECT
  /** Establish the connection between two Viewports. When this method is called, `view2` is initialized with the state of `view1`.
   * Thereafter, any change to the camera of either view will be reflected in the frustum of the other view.
   */
  public connect(view1: Viewport, view2: Viewport) {
    this.disconnect();

    view1.turnCameraOn();
    view2.turnCameraOn();

    this.changeCameraPositionAndTarget(view1, view2);

    // listen to the onViewChanged events from both views
    this._disconnect.push(view1.onViewChanged.addListener(() => this.changeCameraPositionAndTarget(view1, view2)));
    this._disconnect.push(view2.onViewChanged.addListener(() => this.changeCameraPositionAndTarget(view2, view1)));
  }
  // END CONNECT

  /** Remove the connection between the two views. */
  public disconnect() {
    this._disconnect.forEach((f) => f());
    this._disconnect.length = 0;
  }
}
