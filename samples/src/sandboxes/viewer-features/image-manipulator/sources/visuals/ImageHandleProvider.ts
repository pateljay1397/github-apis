/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { BeButtonEvent, DecorateContext, Decorator, EditManipulator, EventHandled, HitDetail } from "@itwin/core-frontend";
import { Point3d } from "@itwin/core-geometry";
import { ImageManipulatorHandle, ImageManipulatorTool } from "../ImageManipulatorTool";
import { getCenterOfCorners, ImageDecorator } from "./ImageDecorator";
import { ImageManipulatorGraphics } from "./ImageManipulatorGraphics";

export class ImageHandleProvider extends EditManipulator.HandleProvider implements Decorator {
  /** The main decorator that is responsible for drawing the image */
  private decorator: ImageDecorator | undefined;

  public setDecorator(dec: ImageDecorator) {
    this.decorator = dec;
  }

  /** Called on selection set change. If SS contains the main decorator's image, draw controls on it */
  protected async createControls(): Promise<boolean> {
    const id = this.decorator?.getID("picture");
    if (id === undefined) {
      return false;
    }

    if (id && this.iModel.selectionSet.elements.has(id)) {
      this.updateDecorationListener(true);
      return true;
    }
    return false;
  }

  /** Handle a mouse event on one of the controls */
  protected async modifyControls(_hit: HitDetail, _ev: BeButtonEvent): Promise<boolean> {
    if (this.decorator === undefined)
      return false;

    let toolType: ImageManipulatorHandle | undefined;

    switch (_hit.sourceId) {
      case this.decorator.getID("resize_top_right"):
        toolType = ImageManipulatorHandle.top_right;
        break;

      case this.decorator.getID("resize_top_left"):
        toolType = ImageManipulatorHandle.top_left;
        break;

      case this.decorator.getID("resize_bot_left"):
        toolType = ImageManipulatorHandle.bot_left;
        break;

      case this.decorator.getID("resize_bot_right"):
        toolType = ImageManipulatorHandle.bot_right;
        break;

      case this.decorator.getID("picture"):
        toolType = ImageManipulatorHandle.translate;
        break;

      case this.decorator.getID("push_pull"):
        toolType = ImageManipulatorHandle.push_pull;
        break;

      case this.decorator.getID("rotZ"):
        this.decorator.setInitialAngleNeedsUpdateToTrue();
        toolType = ImageManipulatorHandle.rotZ;
        break;

      case this.decorator.getID("rotY"):
        this.decorator.setInitialAngleNeedsUpdateToTrue();
        toolType = ImageManipulatorHandle.rotY;
        break;

      case this.decorator.getID("rotX"):
        toolType = ImageManipulatorHandle.rotX;
        this.decorator.setInitialAngleNeedsUpdateToTrue();
        break;
    }

    if (toolType === undefined)
      return false;

    const imageManipulatorTool = new ImageManipulatorTool(this, this.iModel, this.decorator, _ev.viewPoint, toolType, _ev.isShiftKey);
    void imageManipulatorTool.run();
    return true;

  }

  /** Draw the controls on top of the image */
  public decorate(context: DecorateContext) {
    if (this.decorator === undefined)
      return;

    const corners = this.decorator.getCorners();
    const centerOfCorners = getCenterOfCorners(corners, 0.01);

    const scaledSize = this._calculateScaledSize();

    const drawProps = {
      context,
      transform: this.decorator.getTransform(),
      scaledSize,
    };

    /** Draw each item. (drawProps, origin, id) */
    ImageManipulatorGraphics.drawColoredAxes(drawProps, centerOfCorners.clone());
    ImageManipulatorGraphics.drawResizeHandle(drawProps, corners[0], this.decorator.getID("resize_top_right")!);
    ImageManipulatorGraphics.drawResizeHandle(drawProps, corners[1], this.decorator.getID("resize_top_left")!);
    ImageManipulatorGraphics.drawResizeHandle(drawProps, corners[2], this.decorator.getID("resize_bot_left")!);
    ImageManipulatorGraphics.drawResizeHandle(drawProps, corners[3], this.decorator.getID("resize_bot_right")!);
    ImageManipulatorGraphics.drawPushPullHandle(drawProps, Point3d.create(centerOfCorners.x, corners[2].y-2*scaledSize, 0), this.decorator.getID("push_pull")!);
    ImageManipulatorGraphics.drawRotZHandle(drawProps, Point3d.create(centerOfCorners.x, corners[0].y+2*scaledSize), this.decorator.getID("rotZ")!);
    ImageManipulatorGraphics.drawRotYHandle(drawProps, Point3d.create(corners[0].x+2*scaledSize, centerOfCorners.y), this.decorator.getID("rotY")!);
    ImageManipulatorGraphics.drawRotXHandle(drawProps, Point3d.create(corners[2].x-2*scaledSize, centerOfCorners.y), this.decorator.getID("rotX")!);

  }

  /** Don't let controls get so big as to be bigger than the image */
  private _calculateScaledSize() {
    const imageSize = this.decorator!.getImageSize();

    const scaledSize = 1.75;
    let newScaledSizeX = scaledSize;
    let newScaledSizeY = scaledSize;

    if (scaledSize * 4 > imageSize.x / 3) {
      newScaledSizeX = imageSize.x/6;
    }
    if (scaledSize * 4 > imageSize.y / 3) {
      newScaledSizeY = imageSize.y/6;
    }

    /** Most of the time, the scaled size will be a constant 1. Only when the image gets really thin will the new scale kick in */
    return Math.min(newScaledSizeX, newScaledSizeY, 1);
  }

  /** When a decoration is interacted with, forward to modifyControls */
  public async onDecorationButtonEvent(hit: HitDetail, ev: BeButtonEvent): Promise<EventHandled> {
    void this.modifyControls(hit, ev);
    return EventHandled.Yes;
  }

  /** Check if decorationID is part of map. Required for onDecorationButtonEvent */
  public testDecorationHit(_id: string) {
    if (this.decorator === undefined)
      return false;

    let isValid = false;

    for (const mapID of this.decorator.decorationIDMap.values()) {
      if (mapID === _id)
        isValid = true;
    }

    return isValid;
  }

}
