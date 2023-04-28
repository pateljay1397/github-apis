/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { IModelConnection } from "@itwin/core-frontend";
import { ImageDecorator } from "./visuals/ImageDecorator";

export class ImageManipulatorApi {
  private static imageDecorator: ImageDecorator;

  /** Start up the ImageDecorator and generate IDs for the different decorations */
  public static async createDecorator(iModel: IModelConnection, imgs: string[], size: {x: number, y: number}) {
    const decorator = await ImageDecorator.start(imgs, size);

    if (decorator) {
      ImageManipulatorApi.imageDecorator = decorator;
      ImageManipulatorApi.imageDecorator.generateDecorationIDs(iModel);
    } else
      console.error("Error creating decorator");

    return this.imageDecorator;
  }

  /** Change the opacity of the image. 0 is invisible and 1 is fully visible */
  public static setImageAlpha(newAlpha: number) {
    if (this.imageDecorator === undefined)
      return;

    this.imageDecorator.setAlpha(newAlpha);
  }

  /** Move the camera to be perpendicular to the image */
  public static lookAtImage() {
    if (this.imageDecorator === undefined)
      return;

    this.imageDecorator.lookAtImage();
  }

  /** Change the texture of the image and move it to it's default location */
  public static changeTextureIndexAndPlacement(index: number) {
    if (this.imageDecorator === undefined)
      return;

    this.imageDecorator.setTextureIndexAndMoveImage(index);
  }
}
