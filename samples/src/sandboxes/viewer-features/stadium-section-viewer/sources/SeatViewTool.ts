/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { BeButtonEvent, BeWheelEvent, EventHandled, IModelApp, ScreenViewport, Viewport, ViewState3d, ViewTool } from "@itwin/core-frontend";
import { Angle, Arc3d, Matrix3d, Point3d, Transform, Vector3d } from "@itwin/core-geometry";

export class SeatViewTool extends ViewTool {
  public static toolId = "SeatViewTool";
  private _keyDown: boolean = false;
  private _eyePoint: Point3d;
  private _arc: Arc3d;
  private _viewport: ScreenViewport;
  private _viewDirection: string;

  constructor(viewport: ScreenViewport, eyePoint: Point3d, arc: Arc3d, viewDirection: string) {
    super(viewport);
    this._viewport = viewport;
    this._eyePoint = eyePoint;
    this._arc = arc;
    this._viewDirection = viewDirection;
  }

  public isCompatibleViewport(vp: Viewport | undefined, isSelectedViewChange: boolean): boolean { return (super.isCompatibleViewport(this._viewport, isSelectedViewChange) && undefined !== vp); }
  public override async onPostInstall() { this.setupAndPromptForNextAction(); }

  protected setupAndPromptForNextAction(): void {
    const vp = this._viewport;
    // Ensure view is a 3d view state.
    if(!vp.view.is3d()) return;

    const targetPoint = this._viewDirection === "Left" ? this._arc.startPoint() :  this._arc.endPoint();
    vp.view.lookAt({ eyePoint: this._eyePoint, targetPoint, upVector: new Vector3d(0, 0, 1), lensAngle: vp.view.camera.lens});

    vp.animateFrustumChange({
      animationTime: 5000,
      cancelOnAbort: false,
      animationFinishedCallback: (didComplete) => {
        if(didComplete){
          this._viewDirection = this._viewDirection === "Left" ? "Right" : "Left";
          void IModelApp.tools.run(SeatViewTool.toolId, this._viewport, this._eyePoint, this._arc, this._viewDirection);
        }
      },
    });

    vp.invalidateRenderPlan();
  }

  public async onMiddleButtonDown(_ev: BeButtonEvent): Promise<EventHandled> {
    this.setupAndPromptForNextAction();
    return EventHandled.Yes;
  }

  public async onMouseWheel(_ev: BeWheelEvent): Promise<EventHandled> {
    this.setupAndPromptForNextAction();
    return EventHandled.Yes;
  }

  public async onMouseStartDrag(_ev: BeButtonEvent): Promise<EventHandled> {
    this._keyDown = true;
    this._viewport?.setAnimator(undefined);
    return EventHandled.Yes;
  }

  public async onMouseEndDrag(_ev: BeButtonEvent): Promise<EventHandled> {
    this._keyDown = false;
    this.setupAndPromptForNextAction();
    return EventHandled.Yes;
  }

  public async onDataButtonDown(_ev: BeButtonEvent): Promise<EventHandled> {
    this.setupAndPromptForNextAction();
    return EventHandled.Yes;
  }

  public async onDataButtonUp(_ev: BeButtonEvent): Promise<EventHandled> {
    this.setupAndPromptForNextAction();
    return EventHandled.Yes;
  }

  public async onResetButtonUp(_ev: BeButtonEvent): Promise<EventHandled>{
    this.setupAndPromptForNextAction();
    return EventHandled.Yes;
  }

  public async onResetButtonDown(_ev: BeButtonEvent): Promise<EventHandled>{
    this.setupAndPromptForNextAction();
    return EventHandled.Yes;
  }

  public async onMouseMotion(_ev: BeButtonEvent): Promise<void> {
    if (this._keyDown) {
      if (_ev.viewport === undefined)
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
