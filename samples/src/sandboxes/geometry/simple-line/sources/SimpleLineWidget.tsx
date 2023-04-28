/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { ColorByName, ColorDef } from "@itwin/core-common";
import { IModelApp } from "@itwin/core-frontend";
import { Alert, Label, Slider } from "@itwin/itwinui-react";
import { GeometryDecorator } from "./common/utils/GeometryDecorator";
import { InteractivePointMarker } from "./InteractivePointMarker";
import SimpleLineApi from "./SimpleLineApi";
import "./SimpleLine.scss";

export const SimpleLineWidget = () => {
  const [decoratorState, setDecoratorState] = React.useState<GeometryDecorator>();
  const [point1X, setPoint1X] = React.useState<number>(-25);
  const [point1Y, setPoint1Y] = React.useState<number>(-25);
  const [point2X, setPoint2X] = React.useState<number>(20);
  const [point2Y, setPoint2Y] = React.useState<number>(20);

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
    _setGeometry();
  });

  const _setGeometry = () => {
    if (!decoratorState)
      return;

    decoratorState.clearGeometry();
    const myLine = SimpleLineApi.createLineSegmentFromXY(point1X, point1Y, point2X, point2Y);
    decoratorState.addGeometry(myLine);
    const fractions = [0.0, 0.1, 0.15, 0.2, 0.25, 0.5, 0.9, 1.0, 1.1];
    const points = SimpleLineApi.createPointsAlongLine(myLine, fractions);
    points.forEach((point, i) => {
      const marker = new InteractivePointMarker(point, `Fraction = ${fractions[i]}`, ColorDef.fromTbgr(ColorDef.withTransparency(ColorDef.create(ColorByName.cyan).tbgr, 50)), () => { });
      decoratorState.addMarker(marker);
    });
  };

  return (
    <div className="sample-options">
      <div className="sample-grid">
        <div className="sample-control">
          <Label displayStyle="inline">Point 1 X:</Label>
          <Slider min={-50} minLabel="" max={50} maxLabel="" tickLabels={[-50, 0, 50]} values={[point1X]} onUpdate={(values) => setPoint1X(values[0])} />
        </div>
        <div className="sample-control">
          <Label displayStyle="inline">Point 1 Y:</Label>
          <Slider min={-50} minLabel="" max={50} maxLabel="" tickLabels={[-50, 0, 50]} values={[point1Y]} onUpdate={(values) => setPoint1Y(values[0])} />
        </div>
        <div className="sample-control">
          <Label displayStyle="inline">Point 2 X:</Label>
          <Slider min={-50} minLabel="" max={50} maxLabel="" tickLabels={[-50, 0, 50]} values={[point2X]} onUpdate={(values) => setPoint2X(values[0])} />
        </div>
        <div className="sample-control">
          <Label displayStyle="inline">Point 2 Y:</Label>
          <Slider min={-50} minLabel="" max={50} maxLabel="" tickLabels={[-50, 0, 50]} values={[point2Y]} onUpdate={(values) => setPoint2Y(values[0])} />
        </div>
      </div>

      <Alert type="informational" className="instructions">Creating line segments and points along it</Alert>
    </div>
  );
};

export class SimpleLineWidgetProvider implements UiItemsProvider {
  public readonly id: string = "SimpleLineWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Bottom) {
      widgets.push(
        {
          id: "SimpleLineWidget",
          label: "Simple Line Selector",
          defaultState: WidgetState.Open,
          getWidgetContent: () => <SimpleLineWidget />,
        }
      );
    }
    return widgets;
  }
}
