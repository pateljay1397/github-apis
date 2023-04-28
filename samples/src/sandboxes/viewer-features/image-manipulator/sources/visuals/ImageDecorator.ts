/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { ColorDef, RenderMaterial, RenderTexture, TextureMapping } from "@itwin/core-common";
import { DecorateContext, Decorator, IModelApp, IModelConnection, TextureOwnership } from "@itwin/core-frontend";
import { Angle, AxisIndex, Matrix3d, Point2d, Point3d, Transform, Vector3d, XAndY } from "@itwin/core-geometry";
import { ImageManipulatorTool } from "../ImageManipulatorTool";
import { ImageManipulatorGraphics } from "./ImageManipulatorGraphics";

export class ImageDecorator implements Decorator {
  /** Image opacity  */
  private alpha: number;

  /** The array of textures */
  private tx: RenderTexture[] = [];

  /** Which texture is active in array */
  private textureIndex: number = 0;

  /** Where each corner is of the image, relative to it's origin */
  private corners: Point3d[];

  /** The origin of the image */
  private origin: Point3d = Point3d.create();

  /** The angle of rotation of the image */
  private rotationMatrix: Matrix3d;

  /** Captures the initial angle the mouse makes to the vertical when rotating around an axis so that it is relative */
  private initialAngle: Angle = Angle.create360();

  /** A rotation handle was clicked and the inital angle needs to be captured */
  private initialAngleNeedsUpdate = false;

  /** Maps generated decoration IDs with strings - see bottom of file for list of IDs */
  public decorationIDMap = new Map<string, string>([]);

  /** Keeps track of the vector normal to each image (before any rotation) */
  private initialNormal: Vector3d = Vector3d.unitX();

  /** Populate texture array with pictures from the URLs */
  public static async start(imgSources: string[], size: XAndY): Promise<ImageDecorator | undefined> {
    const txArr: RenderTexture[] = [];
    for (const src of imgSources) {

      const img = await createImageFromSource(src);

      const createTxArgs = {
        image: {
          source: img,
        },
        ownership: "external" as TextureOwnership,
      };

      const tx = IModelApp.renderSystem.createTexture(createTxArgs);

      if (tx) txArr.push(tx);
    }

    return new ImageDecorator(txArr, size);
  }

  /** Move the origin, change the normal, and reset the rotation matrix to reset image */
  private placeImage(index: number) {
    this.origin = IMAGE_CONSTANTS[index].targ.clone();
    this.initialNormal = Vector3d.create(IMAGE_CONSTANTS[index].cam.x-IMAGE_CONSTANTS[index].targ.x, IMAGE_CONSTANTS[index].cam.y-IMAGE_CONSTANTS[index].targ.y, IMAGE_CONSTANTS[index].cam.z-IMAGE_CONSTANTS[index].targ.z);
    this.initialNormal.normalizeInPlace();
    this.rotationMatrix = Matrix3d.createIdentity();
    this.corners = getCornersFromSize(IMAGE_CONSTANTS[index].size, 0);
  }

  /** Private constructor to be called by 'start' */
  private constructor(textures: RenderTexture[], size: XAndY) {

    this.tx = textures;
    this.alpha = .7;
    this.corners = getCornersFromSize(size, 0);
    this.placeImage(0);
    this.rotationMatrix = Matrix3d.createIdentity();

    IModelApp.tools.register(ImageManipulatorTool, "manip-i18n-namespace");
  }

  // Setters / Modifiers
  public setInitialAngleNeedsUpdateToTrue() {
    this.initialAngleNeedsUpdate = true;
  }

  public rotateByAngleAroundAxis(angle: Angle, axis: AxisIndex) {
    /** The first time this function is called by the tool, this flag is true and the initial angle is updated.
     *  This ensures that all motion is relative to wherever the mouse was when the handle was clicked. */
    if (this.initialAngleNeedsUpdate) {
      this.initialAngle.setDegrees(angle.degrees);
      this.initialAngleNeedsUpdate = false;
    }

    const angleToRotate = Angle.createDegrees(angle.degrees - this.initialAngle.degrees);
    this.initialAngle.setDegrees(angle.degrees);

    let rot;
    switch (axis) {
      case AxisIndex.X:
        rot = Matrix3d.createRowValues(1, 0, 0, 0, Math.cos(angleToRotate.radians), -Math.sin(angleToRotate.radians), 0, Math.sin(angleToRotate.radians), Math.cos(angleToRotate.radians));
        break;
      case AxisIndex.Y:
        rot = Matrix3d.createRowValues(Math.cos(angleToRotate.radians), 0, Math.sin(angleToRotate.radians), 0, 1, 0, -Math.sin(angleToRotate.radians), 0, Math.cos(angleToRotate.radians));
        break;
      case AxisIndex.Z:
        rot = Matrix3d.createRowValues(Math.cos(angleToRotate.radians), -Math.sin(angleToRotate.radians), 0, Math.sin(angleToRotate.radians), Math.cos(angleToRotate.radians), 0, 0, 0, 1);
        break;
    }

    this.rotationMatrix.multiplyMatrixMatrix(rot, this.rotationMatrix);
  }

  public setTextureIndexAndMoveImage(index: number) {
    this.textureIndex = index;
    this.placeImage(index);
  }

  public setAlpha(alpha: number) {
    this.alpha = alpha;
  }

  public setZHeight(z: number) {
    this.origin.z = z;
  }

  public addXYToCorner(cornerIndex: number, x: number, y: number) {
    this.corners[cornerIndex].addInPlace({x, y, z: 0});
  }

  public addXYToOrigin(x: number, y: number) {
    const matrix = this.getTransform().matrix.clone();
    const resultX = matrix.columnX().normalize()!.scale(x);
    const resultY = matrix.columnY().normalize()!.scale(y);

    this.origin.addInPlace({x: resultX.x + resultY.x, y: resultX.y + resultY.y, z: resultX.z + resultY.z});
  }

  public addZToOrigin(z: number) {
    const matrix = this.getTransform().matrix.clone();
    const resultZ = matrix.columnZ().normalize()!.scale(z);

    this.origin.addInPlace({x: resultZ.x, y: resultZ.y, z: resultZ.z});
  }

  // Getters
  public getTextureCount() {
    return this.tx.length;
  }

  public getCurrentTextureIndex() {
    return this.textureIndex;
  }

  public getOrigin() {
    return this.origin;
  }

  public getCorners() {
    return this.corners;
  }

  public getImageSize() {
    return getSizeFromCorners(this.corners);
  }

  public getID(name: string) {
    return this.decorationIDMap.get(name);
  }

  public getAspectRatio() {
    return this.corners[0].distance(this.corners[1]) / this.corners[0].distance(this.corners[3]);
  }

  /** Return transform that holds image origin and rotation information */
  public getTransform() {
    // Perp. to forward vector and unitZ vector
    const rightVector = this.initialNormal.crossProduct(Vector3d.unitZ());

    // Correct "up" vector
    const upVector = rightVector.crossProduct(this.initialNormal);

    // normalize for unit vectors
    rightVector.normalizeInPlace();
    upVector.normalizeInPlace();

    // create transform
    const transform = Transform.createOriginAndMatrixColumns(this.origin, rightVector, upVector, this.initialNormal);

    // Rotation
    const result = transform.multiplyTransformMatrix3d(this.rotationMatrix);

    return result;
  }

  /** Draw the image as a rectangle with texture applied to it */
  public decorate(context: DecorateContext): void {
    if (!this.tx) return;

    /** Create material */
    const material = this.createMaterial(context, this.tx[this.textureIndex], this.alpha);
    if (!material) {
      console.log("Material was not created");
      return;
    }

    ImageManipulatorGraphics.drawImage(context, this.getTransform(), this.decorationIDMap.get("picture")!, material, this.corners);
  }

  /** When image gets resized, the origin must be recalculated to be the center of the new corners, and the corners must be updated to be relative to the new origin */
  public recalculateOrigin() {
    const oldSize = getSizeFromCorners(this.corners);
    const newRelativeOrigin = getCenterOfCorners(this.corners, 0);

    const transformedRelative = this.getTransform().multiplyPoint3d(newRelativeOrigin);
    this.origin = transformedRelative;
    this.corners = getCornersFromSize(oldSize, 0);
  }

  /** Create the material using the iamge as a texture*/
  private createMaterial(context: DecorateContext, tx: RenderTexture, alpha: number): RenderMaterial | undefined {
    if (!this.decorationIDMap.get("picture")) {
      return;
    }

    const transform = new TextureMapping.Trans2x3(1,0,0,0,1,0);

    const matArgs = {
      alpha,
      diffuse: {
        color: ColorDef.green,
      },
      specular: undefined,
      textureMapping: {
        texture: tx,
        transform,
        weight: 1,
      },
    };

    return context.viewport.target.renderSystem.createRenderMaterial(matArgs);
  }

  /** Check if decorationID is part of map when clicked. Required for onDecorationButtonEvent */
  public testDecorationHit(_id: string) {
    let isValid = false;

    for (const mapID of this.decorationIDMap.values()) {
      if (mapID === _id)
        isValid = true;
    }

    return isValid;
  }

  /** Generate unique IDs for clickable decorations */
  public generateDecorationIDs = (conn: IModelConnection) => {
    for (const id of LIST_OF_IDS)
      this.decorationIDMap.set(id, conn.transientIds.next);
  };

  /** Position the camera to be perpendicular to image */
  public lookAtImage() {
    const firstVP = IModelApp.viewManager.getFirstOpenView();

    const eye = this.getTransform().multiplyPoint3d(Point3d.create(0, 0, 18));
    const targ = this.origin;

    if (firstVP && firstVP.view.isSpatialView()) {
      firstVP.view.lookAt({
        eyePoint: eye,
        upVector: Vector3d.unitZ(),// this.getTransform().matrix.clone().columnY(),
        targetPoint: targ,
        lensAngle: Angle.createDegrees(75),
      });

      firstVP.synchWithView({ animateFrustumChange: true });
    }
  }
}

/** Creates an image element from source string */
const createImageFromSource = async (source: string) => {
  return new Promise((resolve: (image: HTMLImageElement) => void, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);

    // The "error" produced by Image is not an Error. It looks like an Event, but isn't one.
    image.onerror = () => reject(new Error("Failed to create image from url"));
    image.src = source;
  });
};

/** List of string IDs that the map associates with transient iModel ids for the clickable decorations */
const LIST_OF_IDS = [
  "picture",
  "resize_top_right",
  "resize_top_left",
  "resize_bot_left",
  "resize_bot_right",
  "push_pull",
  "rotZ",
  "rotY",
  "rotX",
];

/** Helper function to calculate relative points of corners of a rectangle given its size */
export const getCornersFromSize = (size: XAndY, z: number) => {
  const halfWidth = size.x / 2;
  const halfHeight = size.y / 2;
  const corners = [
    new Point3d(halfWidth, halfHeight, z),
    new Point3d(-halfWidth, halfHeight, z),
    new Point3d(-halfWidth, -halfHeight, z),
    new Point3d(halfWidth, -halfHeight, z),
  ];
  return corners;
};

/** Helper function to get the center point of for corners */
export const getCenterOfCorners = (c: Point3d[], zHeight: number) => {
  return Point3d.create((c[0].x + c[1].x) / 2, (c[0].y + c[2].y) / 2, zHeight);
};

/** Helper function to get the size of a rectangle (length/width) given its corners */
export const getSizeFromCorners = (corners: Point3d[]) => {
  if (corners.length !== 4)
    return {x: 0, y: 0};
  return {x: (corners[0].x-corners[1].x), y: (corners[0].y-corners[3].y)};
};

/** Contains the size and location information for the two pictures used in this sample */
const IMAGE_CONSTANTS = [
  {
    cam: Point3d.createFrom({x: 775936.6825026638, y: 83323.88799394891, z: 157.39708667340537}),
    targ: Point3d.createFrom({x: 775923.4163279468, y: 83336.66367516608, z: 159.99493805176868}),
    size: Point2d.createFrom({x: 18.25, y: 13.688}),
  },
  {
    cam: Point3d.createFrom({x: 775963.8004643656, y: 83351.66020482639, z: 158.27474474305055}),
    targ: Point3d.createFrom({x: 775945.319697595, y: 83365.85733223664, z: 160.13669648479237}),
    size: Point2d.createFrom({x: 22.2309107904, y: 16.6737921588}),

  },
];
