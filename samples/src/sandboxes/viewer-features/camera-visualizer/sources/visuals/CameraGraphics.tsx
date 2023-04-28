/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { ColorDef } from "@itwin/core-common";

import { DecorateContext, GraphicBranch, GraphicBuilder, GraphicType } from "@itwin/core-frontend";
import { Arc3d, Cone, Plane3dByOriginAndUnitNormal, Point3d, Sphere, Transform } from "@itwin/core-geometry";
import { CustomCamera } from "./CustomCamera";

export interface CameraGraphicsProps {
  context: DecorateContext;
  camera: CustomCamera;
  decorationIDMap: Map<string, string>;
}

export class CameraGraphics {

  private static COLOR_TOP = ColorDef.fromString("#FFC20A");
  private static COLOR_BOTTOM = ColorDef.fromString("#0C7BDC");

  /** Draws Target point in center of first viewport */
  public static drawTarget(props: CameraGraphicsProps) {
    /** Draw an opaque target as a World Decoration */
    this._buildTarget(props, 0);

    /** Draw a translucent target as a World Overlay (so it's still slightly visible through walls) */
    this._buildTarget(props, 200);
  }

  /** Handles building the Target graphic */
  private static _buildTarget(props: CameraGraphicsProps, transparency: number) {

    // Outer Circle
    CameraGraphics._addCircle(props, transparency, [0, .1, 0]);

    // Middle Circle
    CameraGraphics._addCircle(props, transparency, [-.01, .06, 2], true);

    // Inner Cicle
    CameraGraphics._addCircle(props, transparency, [-.02, .025, 1]);

  }

  private static _addCircle(props: CameraGraphicsProps, transparency: number, options: number[], overrideWhite: boolean = false) {

    const targetTranslationTransform = Transform.createTranslation(props.camera.getTarget());
    const eyeTransform = props.camera.getTransform();
    const color = overrideWhite ? ColorDef.white : props.camera.getColor();
    const targetBuilder = props.context.createGraphicBuilder(transparency === 0 ? GraphicType.WorldDecoration : GraphicType.WorldOverlay, targetTranslationTransform);

    targetBuilder.setSymbology(color.withTransparency(transparency), color.withTransparency(transparency), 0.5);

    const centerPoint = Point3d.createZero();
    centerPoint.addScaledInPlace(eyeTransform.matrix.columnX(), options[0]);
    const circle = Arc3d.createCenterNormalRadius(
      centerPoint,
      eyeTransform.matrix.columnX(),
      options[1]
    );
    targetBuilder.addArc2d(circle, true, true, targetTranslationTransform.getOrigin().z-options[2]);

    props.context.addDecorationFromBuilder(targetBuilder);

  }

  /** Draws the cones around the camera that allow for translation by clicking */
  public static drawTranslationCones(props: CameraGraphicsProps) {
    const cameraTransform = props.camera.getTransform();
    const targetTransform = Transform.createTranslation(props.camera.getTarget());

    try {
      CameraGraphics._buildConeGroup(props.context, cameraTransform, "cam", props.decorationIDMap, true);
      CameraGraphics._buildConeGroup(props.context, targetTransform, "targ", props.decorationIDMap);
    } catch(e) {
      console.log(e);
    }

  }

  private static _buildConeGroup(context: DecorateContext, transform: Transform, idPrefix: string, map: Map<string, string>, shouldColorTopAndBottom = false) {
    // Distance from point for start of cone
    const startDist = .75;
    // Distance from point for end of cone
    const endDist = 2.5;

    CameraGraphics._drawTranslationCone(transform, context, map.get(`${idPrefix}_trans_x_pos`)!, new Point3d(startDist, 0, 0),  new Point3d(endDist, 0, 0));
    CameraGraphics._drawTranslationCone(transform, context, map.get(`${idPrefix}_trans_x_neg`)!, new Point3d(-startDist, 0, 0), new Point3d(-endDist, 0, 0));
    CameraGraphics._drawTranslationCone(transform, context, map.get(`${idPrefix}_trans_y_pos`)!, new Point3d(0, startDist, 0),  new Point3d(0, endDist, 0), shouldColorTopAndBottom ? this.COLOR_TOP : undefined);
    CameraGraphics._drawTranslationCone(transform, context, map.get(`${idPrefix}_trans_y_neg`)!, new Point3d(0, -startDist, 0), new Point3d(0, -endDist, 0), shouldColorTopAndBottom ? this.COLOR_BOTTOM : undefined);
    CameraGraphics._drawTranslationCone(transform, context, map.get(`${idPrefix}_trans_z_pos`)!, new Point3d(0, 0, startDist),  new Point3d(0, 0, endDist));
    CameraGraphics._drawTranslationCone(transform, context, map.get(`${idPrefix}_trans_z_neg`)!, new Point3d(0, 0, -startDist), new Point3d(0, 0, -endDist));
  }

  /** Draws a cone */
  private static _drawTranslationCone(t: Transform, c: DecorateContext, id: string, coneEndpointA: Point3d, coneEndpointB: Point3d, color: ColorDef = ColorDef.fromString("#444444").withTransparency(200)) {
    const coneBuilder = c.createGraphic({type: GraphicType.WorldOverlay, pickable: {id}, placement: t} );
    coneBuilder.setSymbology(color, color, 1);
    const myCone = Cone.createAxisPoints(coneEndpointA, coneEndpointB, .3, 0, true);

    if (myCone) {
      coneBuilder.addSolidPrimitive(myCone);
      c.addDecorationFromBuilder(coneBuilder);
    }

  }

  /** Draws the camera sphere */
  public static drawCameraSphere(props: CameraGraphicsProps) {
    const transform = props.camera.getTransform();
    const color = props.camera.getColor();

    const camBuilder = props.context.createGraphic({type: GraphicType.WorldDecoration, placement: transform});
    camBuilder.setSymbology(ColorDef.black, color, 6);
    const sphere = Sphere.createCenterRadius(Point3d.createZero(), 0.2); // 0.2 = camera sphere radius
    camBuilder.addSolidPrimitive(sphere);

    try {
      props.context.addDecorationFromBuilder(camBuilder);
    } catch (e) {
      console.log(e);
    }
  }

  /** Draws the FOV box */
  public static drawFOV(props: CameraGraphicsProps) {

    const builderWithEdges = props.context.createGraphic({
      type: GraphicType.WorldDecoration,
      generateEdges: true,
    });
    this._buildFOV(builderWithEdges, props);
    this._addDecorationWithEdgesFromBuilder(builderWithEdges, props.context);
  }

  /** Return four corners of FOV Square in following order: Top Left, Top Right, Bottom Right, Bottom Left */
  private static _getOrientedFOVCorners(originalSquare: Point3d[], props: CameraGraphicsProps) {

    const orientedSquare: Point3d[] = [];

    const targetClone = props.camera.getTarget().clone();

    // Get small vectors in each transformed direction
    const smallVecY = props.camera.getTransform().matrix.columnY().normalize();
    if (smallVecY)
      smallVecY.scale(.05);
    else
      return originalSquare;

    const smallVecZ = props.camera.getTransform().matrix.columnZ().normalize();
    if (smallVecZ)
      smallVecZ.scale(.05);
    else
      return originalSquare;

    // Get points a small distance in each transformed direction -- each corner of the square will be closest to one
    const pointJustAboveAndLeftOfTarget = targetClone.clone().plus(smallVecY).plus(smallVecZ.negate());
    const pointJustAboveAndRightOfTarget = targetClone.clone().plus(smallVecY).plus(smallVecZ);
    const pointJustBelowAndRightOfTarget = targetClone.clone().plus(smallVecY.negate()).plus(smallVecZ);
    const pointJustBelowAndLeftOfTarget = targetClone.clone().plus(smallVecY.negate()).plus(smallVecZ.negate());

    orientedSquare.push(this._findClosestPointInListToOtherPoint(originalSquare, pointJustAboveAndLeftOfTarget));
    orientedSquare.push(this._findClosestPointInListToOtherPoint(originalSquare, pointJustAboveAndRightOfTarget));
    orientedSquare.push(this._findClosestPointInListToOtherPoint(originalSquare, pointJustBelowAndRightOfTarget));
    orientedSquare.push(this._findClosestPointInListToOtherPoint(originalSquare, pointJustBelowAndLeftOfTarget));

    return orientedSquare;
  }

  private static _findClosestPointInListToOtherPoint(listOfPotentialPoints: Point3d[], otherPoint: Point3d) {
    let distance = Infinity;
    let closestPoint = listOfPotentialPoints[0];

    for (const potentialPoint of listOfPotentialPoints) {
      if (potentialPoint.distance(otherPoint) < distance) {
        distance = potentialPoint.distance(otherPoint);
        closestPoint = potentialPoint;
      }
    }

    return closestPoint;

  }

  /** Draws the graphics for the Field Of View of the camera.  */
  private static _buildFOV(builder: GraphicBuilder, props: CameraGraphicsProps) {

    // Get the plane normal to eye direction at target point
    const myPlane = Plane3dByOriginAndUnitNormal.create(props.camera.getTarget(), props.camera.getTransform().matrix.columnX());
    if (!myPlane) {
      console.log("Error getting target Plane");
      return;
    }

    // Get intersection of frustum and plane
    const myShape = props.camera.getFrustum()?.getIntersectionWithPlane(myPlane);

    if (!myShape) {
      console.log("Error creating shape formed by Frustum and Plane");
      return;
    }

    const colorTranslucent = props.camera.getColor().withTransparency(200);

    /**
     * The order of the points is not fixed for the result of "getIntersectionWithPlane()"
     * In order to know which points correspond to the TOP and BOTTOM of the FOV, this function will
     * return the same points in a fixed order: Top Left, Top Right, Bottom Right, Bottom Left
     */
    const myOrientedSquare = this._getOrientedFOVCorners(myShape, props);

    // Draw colored Line On Bottom
    builder.setSymbology(this.COLOR_BOTTOM, this.COLOR_BOTTOM, 4);
    const bottomCylinder = Cone.createAxisPoints(myOrientedSquare[3], myOrientedSquare[2], .1, .1, true);
    if (bottomCylinder)
      builder.addSolidPrimitive(bottomCylinder);

    // Draw colored Line On Top
    builder.setSymbology(this.COLOR_TOP, this.COLOR_TOP, 4);
    const topCylinder = Cone.createAxisPoints(myOrientedSquare[0], myOrientedSquare[1], .1, .1, true);
    if (topCylinder)
      builder.addSolidPrimitive(topCylinder);

    builder.setSymbology(ColorDef.black, colorTranslucent, 4);

    // Draw FOV box
    builder.addShape([myShape[0], myShape[1], props.camera.getEyePoint()]);
    builder.addShape([myShape[1], myShape[2], props.camera.getEyePoint()]);
    builder.addShape([myShape[2], myShape[3], props.camera.getEyePoint()]);
    builder.addShape([myShape[3], myShape[0], props.camera.getEyePoint()]);

  }

  /** Jumps through the hoops to enable visible edges on a branch and add it to the context */
  private static _addDecorationWithEdgesFromBuilder(builder: GraphicBuilder, context: DecorateContext) {
    const branch = new GraphicBranch(true);
    branch.setViewFlagOverrides({visibleEdges: true});
    branch.add(builder.finish());
    context.addDecoration(GraphicType.WorldDecoration, context.createBranch(branch, Transform.identity));
  }

}
