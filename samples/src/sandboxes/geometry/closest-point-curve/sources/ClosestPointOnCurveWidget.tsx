/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { ColorByName, ColorDef, LinePixels } from "@itwin/core-common";
import { IModelApp } from "@itwin/core-frontend";
import { CurvePrimitive, LineSegment3d, Point3d } from "@itwin/core-geometry";
import { Alert, Input, InputGroup, LabeledSelect, SelectOption } from "@itwin/itwinui-react";
import ClosestPointOnCurveApi from "./ClosestPointOnCurveApi";
import { GeometryDecorator } from "./common/utils/GeometryDecorator";
import { InteractivePointMarker, MovePointTool } from "./InteractivePointMarker";
import { SampleCurveFactory } from "./SampleCurveFactory";
import "./ClosestPointOnCurve.scss";

type CurveType = "Rounded Rectangle" | "Line String" | "Rounded Line String" | "Arc" | "Elliptical Arc";

const CurveTypeOptions: SelectOption<CurveType>[] = [
  { value: "Rounded Rectangle", label: "Rounded Rectangle" },
  { value: "Line String", label: "Line String" },
  { value: "Rounded Line String", label: "Rounded Line String" },
  { value: "Arc", label: "Arc" },
  { value: "Elliptical Arc", label: "Elliptical Arc" },
];

export const ClosestPointOnCurveWidget = () => {
  const [decoratorState, setDecoratorState] = React.useState<GeometryDecorator>();
  const [spacePoint, setSpacePoint] = React.useState<Point3d>(Point3d.create(-10, 10));
  const [closePoint, setClosePoint] = React.useState<Point3d>(Point3d.create());
  const [curveType, setCurveType] = React.useState<CurveType>("Rounded Rectangle");
  const [spacePointMarker, setSpacePointMarker] = React.useState<InteractivePointMarker>();
  const [closePointMarker, setClosePointMarker] = React.useState<InteractivePointMarker>();
  const [curve, setCurve] = React.useState<CurvePrimitive | undefined>(SampleCurveFactory.createCurvePrimitive(curveType, 10));

  useEffect(() => {
    if (!decoratorState) {
      const decorator = new GeometryDecorator();
      IModelApp.viewManager.addDecorator(decorator);
      setDecoratorState(decorator);

      void IModelApp.localization.registerNamespace("camera-i18n-namespace");
      MovePointTool.register("camera-i18n-namespace");
    }

    calculateSpacePoint({ x: -10, y: 10 });
    createPointMarkers();
    updateVisualization();

    return (() => {
      if (decoratorState) {
        IModelApp.viewManager.dropDecorator(decoratorState);
        IModelApp.tools.unRegister(MovePointTool.toolId);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setCurve(SampleCurveFactory.createCurvePrimitive(curveType, 10));
  }, [curveType]);

  useEffect(() => {
    calculateSpacePoint(spacePoint);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curve]);

  useEffect(() => {
    calculateSpacePoint(spacePoint);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spacePointMarker]);

  useEffect(() => {
    if (curve) {
      const newClosePoint = ClosestPointOnCurveApi.getClosestPointOnCurve(curve, spacePoint);
      if (newClosePoint)
        setClosePoint(newClosePoint);
      updateVisualization();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spacePoint]);

  const createPointMarkers = () => {
    setSpacePointMarker(new InteractivePointMarker(spacePoint, "Space Point", ColorDef.green, (pt: Point3d) => setSpacePoint(pt)));
    setClosePointMarker(new InteractivePointMarker(closePoint, "Close Point", ColorDef.blue, () => { }));
  };

  const calculateSpacePoint = (inPoint: { x?: number, y?: number }) => {
    if (!curve)
      return;

    const newPoint = spacePoint.clone();

    if (inPoint.x) newPoint.x = inPoint.x;
    if (inPoint.y) newPoint.y = inPoint.y;

    const newClosePoint = ClosestPointOnCurveApi.getClosestPointOnCurve(curve, newPoint);

    if (closePoint && newClosePoint) {
      setSpacePoint(newPoint);
      setClosePoint(newClosePoint);
    }
  };

  const updateVisualization = () => {
    if (!decoratorState)
      return;
    // This function updates the decorator which draws the geometry in the view.  We call this when this
    // component is first mounted and then any time component's state is changed.
    decoratorState.clearGeometry();

    if (!curve)
      return;

    // Add the curvePrimitive
    decoratorState.setColor(ColorDef.black);
    decoratorState.setFill(true);
    decoratorState.setFillColor(ColorDef.fromTbgr(ColorDef.withTransparency(ColorDef.create(ColorByName.cyan).tbgr, 50)));
    decoratorState.setLineThickness(5);
    decoratorState.setLinePixels(LinePixels.Solid);
    decoratorState.addGeometry(curve);

    // Add the marker representing the space point
    if (spacePointMarker) {
      spacePointMarker.worldLocation = spacePoint;
      decoratorState.addMarker(spacePointMarker);
    }

    // Add the marker representing the point on the curve
    if (closePointMarker) {
      closePointMarker.worldLocation = closePoint;
      decoratorState.addMarker(closePointMarker);
    }

    // Add a line connecting the two points
    decoratorState.setColor(ColorDef.black);
    decoratorState.setFill(false);
    decoratorState.setLineThickness(2);
    decoratorState.setLinePixels(LinePixels.Code2);
    decoratorState.addLine(LineSegment3d.create(spacePoint, closePoint));
  };

  return (
    <div className="sample-options">
      <div className="sample-grid">
        <LabeledSelect label="Curve Type:" displayStyle="inline" value={curveType} options={CurveTypeOptions} onChange={setCurveType} />
        <InputGroup label="Space Point:" displayStyle="inline">
          <Input value={spacePoint.x.toFixed(2)} type="number" maxLength={8} step={0.1} onChange={(value) => calculateSpacePoint({ x: Number.parseFloat(value.target.value) })}></Input>
          <Input value={spacePoint.y.toFixed(2)} type="number" maxLength={8} step={0.1} onChange={(value) => calculateSpacePoint({ y: Number.parseFloat(value.target.value) })}></Input>
        </InputGroup>
        <InputGroup label="Curve Point:" displayStyle="inline">
          <Input readOnly value={closePoint.x.toFixed(2)} maxLength={8}></Input>
          <Input readOnly value={closePoint.y.toFixed(2)} maxLength={8}></Input>
        </InputGroup>
      </div>
      <Alert type="informational" className="instructions">
        Click on the green space point to move it. The program will calculate the closest point on the curve.
      </Alert>
    </div>
  );
};

export class ClosestPointOnCurveWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ClosestPointOnCurveWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Bottom) {
      widgets.push(
        {
          id: "ClosestPointOnCurveWidget",
          label: "Closest Point On Curve",
          defaultState: WidgetState.Open,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <ClosestPointOnCurveWidget />,
        }
      );
    }
    return widgets;
  }
}
