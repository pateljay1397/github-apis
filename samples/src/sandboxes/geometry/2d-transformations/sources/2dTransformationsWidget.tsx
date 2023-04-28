/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { ColorByName, ColorDef } from "@itwin/core-common";
import { IModelApp } from "@itwin/core-frontend";
import { Loop, Point3d } from "@itwin/core-geometry";
import { SvgArrowDown, SvgArrowLeft, SvgArrowRight, SvgArrowUp, SvgRotateLeft, SvgRotateRight } from "@itwin/itwinui-icons-react";
import { Alert, Button, ButtonGroup, IconButton, LabeledInput, LabeledSelect, SelectOption } from "@itwin/itwinui-react";
import Transformations2dApi from "./2dTransformationsApi";
import { GeometryDecorator } from "./common/utils/GeometryDecorator";
import "./2dTransformations.scss";

enum Direction {
  Up,
  Down,
  Left,
  Right
}

type Shape = "Square" | "Circle" | "Triangle" | "Convex Hull";

const shapeOptions: SelectOption<Shape>[] = [
  { value: "Square", label: "Square" },
  { value: "Circle", label: "Circle" },
  { value: "Triangle", label: "Triangle" },
  { value: "Convex Hull", label: "Convex Hull" },
];

export const Transformations2dWidget = () => {
  const [decoratorState, setDecoratorState] = React.useState<GeometryDecorator>();
  const [shape, setShape] = React.useState<string>("Square");
  const [xTrans, setXTrans] = React.useState<number>(1);
  const [yTrans, setYTrans] = React.useState<number>(1);
  const [rotationDeg, setRotationDeg] = React.useState<number>(5);
  const [geometry, setGeometry] = React.useState<Loop>(Transformations2dApi.generateSquare(Point3d.create(0, 0), 4));
  const [geoUpdate, setGeoUpdate] = React.useState<Boolean>(true);

  useEffect(() => {
    if (!decoratorState) {
      const decorator = new GeometryDecorator();
      IModelApp.viewManager.addDecorator(decorator);
      setDecoratorState(decorator);
    }

    return (() => {
      if (decoratorState)
        IModelApp.viewManager.dropDecorator(decoratorState);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (geometry && decoratorState) {
      decoratorState.clearGeometry();
      decoratorState.setColor(ColorDef.fromTbgr(ColorDef.withTransparency(ColorDef.create(ColorByName.cyan).tbgr, 50)));
      decoratorState.setLineThickness(5);
      decoratorState.addGeometry(geometry);
    }
  });

  const generateBaseGeometry = (newShape: string) => {
    if (newShape === "Square") {
      setGeometry(Transformations2dApi.generateSquare(Point3d.create(0, 0), 4));
      setGeoUpdate(!geoUpdate);
    } else if (newShape === "Circle") {
      setGeometry(Transformations2dApi.generateCircle(Point3d.create(0, 0), 4));
    } else if (newShape === "Triangle") {
      setGeometry(Transformations2dApi.generateTriangle(Point3d.create(0, 4, 0), Point3d.create(-5, -2, 0), Point3d.create(5, -2, 0)));
    } else if (newShape === "Convex Hull") {
      const points: Point3d[] = [];
      points.push(Point3d.create(-8, -5, 1));
      points.push(Point3d.create(-6, -3, 1));
      points.push(Point3d.create(-8, 1, 1));
      points.push(Point3d.create(8, -4, 1));
      points.push(Point3d.create(0, 3, 1));
      points.push(Point3d.create(-10, -1, 1));
      points.push(Point3d.create(-7, -1, 1));
      points.push(Point3d.create(-7, -1, 1));
      points.push(Point3d.create(-7, -1, 1));
      points.push(Point3d.create(-4, 3, 1));
      setGeometry(Transformations2dApi.generateConvexHull(points));
    }
  };

  const translateX = (direction: Direction) => {
    let newGeometry;
    if (direction === Direction.Left)
      newGeometry = Transformations2dApi.handleTranslation(geometry, -xTrans, 0);
    else if (direction === Direction.Right)
      newGeometry = Transformations2dApi.handleTranslation(geometry, xTrans, 0);

    if (newGeometry)
      setGeometry(newGeometry);

    setGeoUpdate(!geoUpdate);
  };

  const translateY = (direction: Direction) => {
    let newGeometry;
    if (direction === Direction.Up)
      newGeometry = Transformations2dApi.handleTranslation(geometry, 0, yTrans);
    else if (direction === Direction.Down)
      newGeometry = Transformations2dApi.handleTranslation(geometry, 0, -yTrans);

    if (newGeometry)
      setGeometry(newGeometry);

    setGeoUpdate(!geoUpdate);
  };

  const rotate = (direction: Direction) => {
    let newGeometry;
    if (direction === Direction.Left)
      newGeometry = Transformations2dApi.handleRotation(geometry, rotationDeg);
    else if (direction === Direction.Right)
      newGeometry = Transformations2dApi.handleRotation(geometry, -rotationDeg);

    if (newGeometry)
      setGeometry(newGeometry);

    setGeoUpdate(!geoUpdate);
  };

  return (
    <div className="sample-options">
      <div className="sample-grid">
        <div className="selectors">
          <LabeledSelect displayStyle="inline" size="small" label="Shape:" options={shapeOptions} value={shape} onChange={(value) => { setShape(value); generateBaseGeometry(value); }} />
          <Button size="small" styleType="high-visibility" onClick={() => generateBaseGeometry(shape)}>Reset</Button>
        </div>
        <div className="controls">
          <div className="control-block">
            <LabeledInput label="Move X:" size="small" type="number" step={1} value={xTrans} displayStyle="inline" onChange={(event) => setXTrans(parseInt(event.target.value, 10))} />
            <ButtonGroup>
              <IconButton size="small" onClick={() => translateX(Direction.Left)}>
                <SvgArrowLeft />
              </IconButton>
              <IconButton size="small" onClick={() => translateX(Direction.Right)}>
                <SvgArrowRight />
              </IconButton>
            </ButtonGroup>
          </div>
          <div className="control-block">
            <LabeledInput label="Move Y:" size="small" type="number" step={1} value={yTrans} displayStyle="inline" onChange={(event) => setYTrans(parseInt(event.target.value, 10))} />
            <ButtonGroup>
              <IconButton size="small" onClick={() => translateY(Direction.Up)}>
                <SvgArrowUp />
              </IconButton>
              <IconButton size="small" onClick={() => translateY(Direction.Down)}>
                <SvgArrowDown />
              </IconButton>
            </ButtonGroup>
          </div>
          <div className="control-block">
            <LabeledInput label="Rotate:" size="small" type="number" step={1} value={rotationDeg} displayStyle="inline" onChange={(event) => setRotationDeg(parseInt(event.target.value, 10))} />
            <ButtonGroup>
              <IconButton size="small" onClick={() => rotate(Direction.Left)}>
                <SvgRotateLeft />
              </IconButton>
              <IconButton size="small" onClick={() => rotate(Direction.Right)}>
                <SvgRotateRight />
              </IconButton>
            </ButtonGroup>
          </div>
        </div>
      </div>
      <Alert type="informational" className="instructions">
        Select a shape and apply transformations to it
      </Alert>
    </div>
  );
};

export class Transformations2dWidgetProvider implements UiItemsProvider {
  public readonly id: string = "Transformations2dWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Bottom) {
      widgets.push(
        {
          id: "2dTransformationsWidget",
          label: "2D Transformations Selector",
          defaultState: WidgetState.Open,
          getWidgetContent: () => <Transformations2dWidget />,
        }
      );
    }
    return widgets;
  }
}
