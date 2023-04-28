/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { ColorByName, ColorDef } from "@itwin/core-common";
import { IModelApp } from "@itwin/core-frontend";
import { Alert, LabeledSelect } from "@itwin/itwinui-react";
import Advanced3dApi from "./Advanced3dApi";
import { GeometryDecorator } from "./common/utils/GeometryDecorator";
import "./Advanced3d.scss";

const shapeOptions = [
  { value: "Sweeps", label: "Sweeps" },
  { value: "Mitered Pipes", label: "Mitered Pipes" },
];
const sweepTypeOptions = [
  { value: "Linear", label: "Linear" },
  { value: "Ruled", label: "Ruled" },
  { value: "Rotational", label: "Rotational" },
];

export const Advanced3dWidget = () => {
  const [decoratorState, setDecoratorState] = React.useState<GeometryDecorator>();
  const [shape, setShape] = React.useState<string>("Sweeps");
  const [color] = React.useState<ColorDef>(ColorDef.fromTbgr(ColorDef.withTransparency(ColorDef.create(ColorByName.cyan).tbgr, 50)));
  const [sweepType, setSweepType] = React.useState<string>("Linear");

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
    if (decoratorState) {
      decoratorState.clearGeometry();
      const polyface = Advanced3dApi.getPolyface(shape, sweepType);
      decoratorState.setColor(color);
      decoratorState.addGeometry(polyface);
      decoratorState.drawBase();
    }
  });

  return (
    <div className="sample-options">
      <div className="controls">
        <LabeledSelect label="Shape:" displayStyle="inline" value={shape} options={shapeOptions} onChange={setShape} />
        {shape === "Sweeps" && <LabeledSelect label="Sweep Type:" displayStyle="inline" value={sweepType} options={sweepTypeOptions} onChange={setSweepType} />}
      </div>
      <Alert type="informational">Select a shape</Alert>
    </div>
  );
};

export class Advanced3dWidgetProvider implements UiItemsProvider {
  public readonly id: string = "Advanced3dWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Bottom) {
      widgets.push(
        {
          id: "Advanced3dWidget",
          label: "Advanced 3d Selector",
          defaultState: WidgetState.Open,
          getWidgetContent: () => <Advanced3dWidget />,
        }
      );
    }
    return widgets;
  }
}
