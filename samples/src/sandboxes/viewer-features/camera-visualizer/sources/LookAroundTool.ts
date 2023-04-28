/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { BeButtonEvent, BeWheelEvent, EventHandled, IModelApp, PrimitiveTool, ScreenViewport, Viewport, ViewState3d } from "@itwin/core-frontend";
import { Angle, Matrix3d, Transform, Vector3d } from "@itwin/core-geometry";

export class LookAroundTool extends PrimitiveTool {
  public static toolId = "LookAroundTool";
  private _keyDown: boolean = false;
  private _mouseScrollCallback: (deltaY: number) => {};
  private _shiftMouseScrollCallback: (deltaY: number) => {};
  private _exitCallback: (isBeingUsed: boolean) => {};
  private _firstVP: ScreenViewport | undefined;

  constructor(mouseScrollCallback: (deltaY: number) => {}, shiftMouseScrollCallback: (deltaY: number) => {}, exitCallback: (isBeingUsed: boolean) => {}) {
    super();
    this._mouseScrollCallback = mouseScrollCallback;
    this._shiftMouseScrollCallback = shiftMouseScrollCallback;
    this._firstVP = IModelApp.viewManager.getFirstOpenView()!;
    this._exitCallback = exitCallback;

  }

  public isCompatibleViewport(vp: Viewport | undefined, isSelectedViewChange: boolean): boolean { return (super.isCompatibleViewport(vp, isSelectedViewChange) && undefined !== vp); }
  public requireWriteableTarget(): boolean { return false; } // Tool doesn't modify the imodel.
  public async onRestartTool(): Promise<void> { this._exitCallback(false); return this.exitTool(); }

  public async onMiddleButtonDown(_ev: BeButtonEvent): Promise<EventHandled> {
    return EventHandled.Yes;
  }

  public async onMouseWheel(_ev: BeWheelEvent): Promise<EventHandled> {
    if (_ev.isShiftKey)
      this._shiftMouseScrollCallback(_ev.wheelDelta);
    else
      this._mouseScrollCallback(_ev.wheelDelta);

    return EventHandled.Yes;
  }

  public async onMouseStartDrag(_ev: BeWheelEvent): Promise<EventHandled> {
    return EventHandled.Yes;
  }

  public async onDataButtonDown(_ev: BeWheelEvent): Promise<EventHandled> {
    this._keyDown = !this._keyDown;
    return EventHandled.Yes;
  }

  public async onDataButtonUp(_ev: BeWheelEvent): Promise<EventHandled> {
    this._keyDown = false;
    return EventHandled.Yes;
  }

  public async onResetButtonDown(_ev: BeWheelEvent): Promise<EventHandled> {
    this._exitCallback(false);
    void this.exitTool();
    return EventHandled.Yes;
  }

  public async onMouseMotion(_ev: BeButtonEvent): Promise<void> {
    if (this._keyDown) {
      if (_ev.viewport === undefined || _ev.viewport.viewportId !== this._firstVP?.viewportId)
        return;
      const viewRect = _ev.viewport.viewRect;
      const xExtent = viewRect.width;
      const yExtent = viewRect.height;
      const rotation = new Matrix3d();
      if (_ev.movement) {
        const xAngle = -(_ev.movement.x / xExtent * 2);
        const yAngle = -(_ev.movement.y / yExtent * 2);
        rotation.setFrom(_ev.viewport.rotation);
        const inverseRotation = rotation.inverse();
        const horizontalRotation = Matrix3d.createRotationAroundVector(Vector3d.unitZ(), Angle.createRadians(xAngle));
        const verticalRotation = Matrix3d.createRotationAroundVector(Vector3d.unitX(), Angle.createRadians(yAngle));
        if (verticalRotation && inverseRotation && horizontalRotation) {
          verticalRotation.multiplyMatrixMatrix(rotation, verticalRotation);
          inverseRotation.multiplyMatrixMatrix(verticalRotation, verticalRotation);
          const newRotation = horizontalRotation.multiplyMatrixMatrix(verticalRotation);
          const transform8 = Transform.createFixedPointAndMatrix((_ev.viewport.view as ViewState3d).camera.getEyePoint(), newRotation);
          const frustum = _ev.viewport.getFrustum().transformBy(transform8);
          _ev.viewport.setupViewFromFrustum(frustum);
        }
        IModelApp.viewManager.invalidateDecorationsAllViews();
      }
    }
  }

  public async onTouchMoveStart(_ev: BeButtonEvent): Promise<EventHandled> {
    return EventHandled.Yes;
  }

  public async onTouchTap(_ev: BeButtonEvent): Promise<EventHandled> {
    return EventHandled.Yes;
  }
}
