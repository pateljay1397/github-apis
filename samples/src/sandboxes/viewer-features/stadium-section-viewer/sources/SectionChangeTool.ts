/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Animator, BeButtonEvent, BeWheelEvent, EventHandled, FrustumAnimator, ScreenViewport, Viewport, ViewTool } from "@itwin/core-frontend";
import { Arc3d, Point3d, Vector3d } from "@itwin/core-geometry";

interface State {
  animator: Animator;
  removeListener: () => void;
}

export class SectionChangeTool extends ViewTool {
  public static toolId = "SectionChangeTool";
  private _state?: State;
  private _eyePoint: Point3d;
  private _arc: Arc3d;
  private _viewport: ScreenViewport;
  private _animationCompleteCallback: () => void;

  constructor(viewport: ScreenViewport,eyePoint: Point3d, arc: Arc3d, animationCompleteCallback = () => {}) {
    super(viewport);
    this._eyePoint = eyePoint;
    this._arc = arc;
    this._viewport = viewport;
    this._animationCompleteCallback = animationCompleteCallback;
  }

  public isCompatibleViewport(vp: Viewport | undefined, isSelectedViewChange: boolean): boolean { return (super.isCompatibleViewport(this._viewport, isSelectedViewChange) && undefined !== vp); }

  public async onMiddleButtonDown(_ev: BeButtonEvent): Promise<EventHandled> {
    return EventHandled.Yes;
  }

  public async onMouseWheel(_ev: BeWheelEvent): Promise<EventHandled> {
    return EventHandled.Yes;
  }

  public async onMouseStartDrag(_ev: BeButtonEvent): Promise<EventHandled> {
    return EventHandled.Yes;
  }

  public async onMouseEndDrag(_ev: BeButtonEvent): Promise<EventHandled> {
    return EventHandled.Yes;
  }

  public async onDataButtonDown(_ev: BeButtonEvent): Promise<EventHandled> {
    return EventHandled.Yes;
  }

  public async onDataButtonUp(_ev: BeButtonEvent): Promise<EventHandled> {
    return EventHandled.Yes;
  }

  public async onTouchMoveStart(_ev: BeButtonEvent): Promise<EventHandled> {
    return EventHandled.Yes;
  }

  public async onTouchTap(_ev: BeButtonEvent): Promise<EventHandled> {
    return EventHandled.Yes;
  }

  public override async onPostInstall() {
    const vp = this._viewport;
    // Ensure view is a 3d view state.
    if(!vp.view.is3d()) return;

    vp.view.lookAt({
      eyePoint: this._eyePoint,
      upVector: Vector3d.unitZ(),
      targetPoint: this._arc.fractionToPointAndDerivative(0.5).origin,
      lensAngle: vp.view.camera.lens,
    });

    const animator = new FrustumAnimator({
      animationTime: 3000,
      cancelOnAbort: false,
    }, vp, (vp as any)._lastPose, vp.view.savePose());

    /* We want to prevent user input/interactions from interrupting this animation.
    This listener prevents that by manually triggering the animator for every frame(onRender).
    The listener also causes the tool to exit when the animation is complete */

    const removeListener = vp.onRender.addListener(() => {
      if (!animator || animator.animate())
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.exitTool();
    });

    this._state = {
      animator,
      removeListener,
    };

    vp.invalidateRenderPlan();
  }

  /* When this tool animation is completed we need to cleanup the animator as well as onRender listener.
  And notify the callback that the animation is completed */

  public override async onCleanup(): Promise<void> {
    if (this._state) {
      this._state.removeListener();
      this._viewport?.setAnimator(undefined);
      this._animationCompleteCallback();
      this._state = undefined;
    }

    return super.onCleanup();
  }
}
