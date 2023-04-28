/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { ColorDef, GraphicParams, RenderMaterial } from "@itwin/core-common";
import { DecorateContext, GraphicType, IModelApp } from "@itwin/core-frontend";
import { AngleSweep, Arc3d, Point2d, Point3d, Transform, Vector3d } from "@itwin/core-geometry";
import { getCornersFromSize } from "./ImageDecorator";

const DRAW_OPTIONS = [{graphicType: GraphicType.WorldDecoration, transparency: 0}, {graphicType: GraphicType.WorldOverlay, transparency: 200}];

export interface DrawProps {
  context: DecorateContext;
  transform: Transform;
  scaledSize: number;
}

/** Handles the graphics construction and adding to context for this sample */
export class ImageManipulatorGraphics {

  public static drawResizeHandle(drawProps: DrawProps, origin: Point3d, id: string) {
    for (const option of DRAW_OPTIONS) {

      const resizeHandleBuilder = drawProps.context.createGraphicBuilder(option.graphicType, drawProps.transform, id);
      resizeHandleBuilder.setSymbology(ColorDef.black.withTransparency(option.transparency), ColorDef.white.withTransparency(option.transparency), 2);
      const corners = getCornersFromSize({x: drawProps.scaledSize/1.5, y: drawProps.scaledSize/1.5}, 0.01);
      corners.forEach((corner) => corner.addInPlace(origin));
      resizeHandleBuilder.addShape(corners);

      resizeHandleBuilder.setSymbology(ColorDef.black, ColorDef.white, 2);
      resizeHandleBuilder.addLineString([...corners, corners[0].clone()]);
      drawProps.context.addDecoration(option.graphicType, resizeHandleBuilder.finish());
    }
  }

  public static drawRotZHandle(drawProps: DrawProps, origin: Point3d, id: string) {
    for (const option of DRAW_OPTIONS) {

      const halfScaledSize = drawProps.scaledSize/2;

      const rotHandleBuilder = drawProps.context.createGraphicBuilder(option.graphicType, drawProps.transform, id);
      rotHandleBuilder.setSymbology(ColorDef.blue.withTransparency(option.transparency), ColorDef.blue.withTransparency(option.transparency), 3);

      // arc
      const mySweep = AngleSweep.createStartEndDegrees(0, 270);
      const myArc = Arc3d.create(Point3d.create(origin.x, origin.y, 0.01), Vector3d.unitX(drawProps.scaledSize), Vector3d.unitY(drawProps.scaledSize), mySweep);
      rotHandleBuilder.addArc(myArc, false, false);

      // triangle
      rotHandleBuilder.addShape2d([Point2d.create(drawProps.scaledSize-halfScaledSize + origin.x, origin.y),
        Point2d.create(drawProps.scaledSize + halfScaledSize + origin.x, origin.y),
        Point2d.create(drawProps.scaledSize + origin.x, -halfScaledSize + origin.y)], 0.01);

      drawProps.context.addDecoration(option.graphicType, rotHandleBuilder.finish());
    }
  }

  public static drawRotYHandle(drawProps: DrawProps, origin: Point3d, id: string) {
    for (const option of DRAW_OPTIONS) {

      const halfScaledSize = drawProps.scaledSize/2;

      const turnHandleBuilder = drawProps.context.createGraphicBuilder(option.graphicType, drawProps.transform, id);
      turnHandleBuilder.setSymbology(ColorDef.red.withTransparency(option.transparency), ColorDef.red.withTransparency(option.transparency), 3);

      // arc
      const mySweep = AngleSweep.createStartEndDegrees(0, 270);
      const myArc = Arc3d.create(Point3d.create(origin.x, origin.y, 0), Vector3d.unitX(drawProps.scaledSize), Vector3d.unitZ(drawProps.scaledSize), mySweep);
      turnHandleBuilder.addArc(myArc, false, false);

      // triangle
      turnHandleBuilder.addShape([Point3d.create(drawProps.scaledSize-halfScaledSize + origin.x, origin.y, origin.z), Point3d.create(drawProps.scaledSize + halfScaledSize + origin.x, origin.y, origin.z), Point3d.create(drawProps.scaledSize + origin.x, origin.y, -halfScaledSize + origin.z)]);
      drawProps.context.addDecoration(option.graphicType, turnHandleBuilder.finish());
    }
  }

  public static drawRotXHandle(drawProps: DrawProps, origin: Point3d, id: string) {
    for (const option of DRAW_OPTIONS) {

      const halfScaledSize = drawProps.scaledSize/2;

      const tiltHandleBuilder = drawProps.context.createGraphicBuilder(option.graphicType, drawProps.transform, id);
      tiltHandleBuilder.setSymbology(ColorDef.green.withTransparency(option.transparency), ColorDef.green.withTransparency(option.transparency), 3);

      // arc
      const mySweep = AngleSweep.createStartEndDegrees(0, 270);
      const myArc = Arc3d.create(Point3d.create(origin.x, origin.y, 0), Vector3d.unitY(drawProps.scaledSize), Vector3d.unitZ(drawProps.scaledSize), mySweep);
      tiltHandleBuilder.addArc(myArc, false, false);

      // triangle
      tiltHandleBuilder.addShape([Point3d.create(origin.x, drawProps.scaledSize-halfScaledSize + origin.y, origin.z), Point3d.create(origin.x, drawProps.scaledSize + halfScaledSize + origin.y, origin.z), Point3d.create(origin.x, drawProps.scaledSize + origin.y, -halfScaledSize + origin.z)]);
      drawProps.context.addDecoration(option.graphicType, tiltHandleBuilder.finish());
    }
  }

  public static drawPushPullHandle(drawProps: DrawProps, origin: Point3d, id: string) {
    for (const option of DRAW_OPTIONS) {

      const halfScaledSize = drawProps.scaledSize/2;

      const pushPullHandleBuilder = drawProps.context.createGraphicBuilder(option.graphicType, drawProps.transform, id);
      pushPullHandleBuilder.setSymbology(ColorDef.black.withTransparency(option.transparency), ColorDef.black.withTransparency(option.transparency), 3);

      // up arrow
      pushPullHandleBuilder.addLineString([origin.clone(), origin.plusXYZ(0, 0, drawProps.scaledSize)]);
      pushPullHandleBuilder.addShape([Point3d.create(-halfScaledSize + origin.x, origin.y, drawProps.scaledSize + origin.z), Point3d.create(halfScaledSize + origin.x, origin.y, drawProps.scaledSize + origin.z), Point3d.create(origin.x, origin.y, drawProps.scaledSize+halfScaledSize + origin.z)]);

      // down arrow
      pushPullHandleBuilder.addLineString([origin.clone(), origin.plusXYZ(0, 0, -drawProps.scaledSize)]);
      pushPullHandleBuilder.addShape([Point3d.create(-halfScaledSize + origin.x, origin.y, -drawProps.scaledSize - origin.z), Point3d.create(halfScaledSize + origin.x, origin.y, -drawProps.scaledSize - origin.z), Point3d.create(origin.x, origin.y, -drawProps.scaledSize-halfScaledSize - origin.z)]);

      drawProps.context.addDecoration(option.graphicType, pushPullHandleBuilder.finish());
    }
  }

  public static drawColoredAxes(drawProps: DrawProps, origin: Point3d) {
    for (const option of DRAW_OPTIONS) {
      const coloredAxesBuilder = drawProps.context.createGraphicBuilder(option.graphicType, drawProps.transform);
      coloredAxesBuilder.setSymbology(ColorDef.green.withTransparency(option.transparency), ColorDef.green.withTransparency(option.transparency), 3);
      coloredAxesBuilder.addLineString([origin.clone(), origin.plusXYZ(3*drawProps.scaledSize, 0, 0)]);

      coloredAxesBuilder.setSymbology(ColorDef.red.withTransparency(option.transparency), ColorDef.red.withTransparency(option.transparency), 3);
      coloredAxesBuilder.addLineString([origin.clone(), origin.plusXYZ(0, 3*drawProps.scaledSize, 0)]);

      coloredAxesBuilder.setSymbology(ColorDef.blue.withTransparency(option.transparency), ColorDef.blue.withTransparency(option.transparency), 3);
      coloredAxesBuilder.addLineString([origin.clone(), origin.plusXYZ(0, 0, 3*drawProps.scaledSize)]);

      const graphics = coloredAxesBuilder.finish();
      drawProps.context.addDecoration(option.graphicType, graphics);
    }
  }

  public static drawImage(context: DecorateContext, transform: Transform, id: string,  material: RenderMaterial, corners: Point3d[]) {
    /** Set up Graphic Builder */
    const builder = context.createGraphicBuilder(GraphicType.WorldDecoration, transform, id);
    builder.setSymbology(ColorDef.white, ColorDef.blue.withTransparency(180), 5);

    /** Add texture to builder */
    const params = new GraphicParams();
    params.material = material;
    builder.activateGraphicParams(params);

    /** Draw the rectangle */
    builder.addShape(corners);

    const graphics = builder.finish();

    /** Add the graphics to the scene */
    context.addDecoration(GraphicType.WorldDecoration, graphics);
  }

  public static drawGuideCircle(context: DecorateContext, color: ColorDef) {
    const screenWidth = IModelApp.viewManager.selectedView!.getClientRect().width;
    const screenHeight = IModelApp.viewManager.selectedView!.getClientRect().height;

    const rotDecorationBuilder = context.createGraphicBuilder(GraphicType.ViewOverlay);
    rotDecorationBuilder.setSymbology(color.withTransparency(235), color.withTransparency(235), 3);

    // arc
    const mySweep = AngleSweep.create360();
    const myArc = Arc3d.create(Point3d.create(screenWidth/2, screenHeight/2), Vector3d.unitX(screenWidth/3), Vector3d.unitY(screenHeight/3), mySweep);
    rotDecorationBuilder.addArc(myArc, false, false);
    rotDecorationBuilder.addLineString([Point3d.create(), Point3d.create(5, 5, 0)]);

    context.addDecoration(GraphicType.ViewOverlay, rotDecorationBuilder.finish());
  }
}
