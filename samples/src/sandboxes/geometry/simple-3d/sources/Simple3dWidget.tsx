/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { ColorByName, ColorDef } from "@itwin/core-common";
import { IModelApp } from "@itwin/core-frontend";
import { PolyfaceBuilder, StrokeOptions } from "@itwin/core-geometry";
import { Alert, LabeledSelect, Slider } from "@itwin/itwinui-react";
import { GeometryDecorator } from "./common/utils/GeometryDecorator";
import Simple3dApi from "./Simple3dApi";
import "./Simple3d.scss";

export const Simple3dWidget = () => {
  const [decoratorState, setDecoratorState] = React.useState<GeometryDecorator>();
  const [shape, setShape] = React.useState<string>("Box");
  const [color] = React.useState<ColorDef>(ColorDef.fromTbgr(ColorDef.withTransparency(ColorDef.create(ColorByName.cyan).tbgr, 50)));
  const [sphereRadius, setSphereRadius] = React.useState<number>(4);
  const [boxLength, setBoxLength] = React.useState<number>(5);
  const [boxWidth, setBoxWidth] = React.useState<number>(5);
  const [boxHeight, setBoxHeight] = React.useState<number>(5);
  const [coneUpperRadius, setConeUpperRadius] = React.useState<number>(3);
  const [coneLowerRadius, setConeLowerRadius] = React.useState<number>(5);
  const [coneHeight, setConeHeight] = React.useState<number>(5);
  const [torusPipeInnerRadius, setTorusPipeInnerRadius] = React.useState<number>(2);
  const [torusPipeOuterRadius, setTorusPipeOuterRadius] = React.useState<number>(5);
  const [torusPipeSweep, setTorusPipeSweep] = React.useState<number>(360);

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
  }, [decoratorState]);

  useEffect(() => {
    _setGeometry();
  });

  const _setGeometry = () => {
    if (!decoratorState)
      return;

    decoratorState.clearGeometry();
    const options = StrokeOptions.createForCurves();
    options.needParams = false;
    options.needNormals = true;
    const builder = PolyfaceBuilder.create(options);
    if (shape === "Cone") {
      const cone = Simple3dApi.createCone(coneHeight, coneLowerRadius, coneUpperRadius);
      if (cone)
        builder.addCone(cone);
    } else if (shape === "Sphere") {
      const sphere = Simple3dApi.createSphere(sphereRadius);
      if (sphere)
        builder.addSphere(sphere);
    } else if (shape === "Box") {
      const box = Simple3dApi.createBox(boxLength, boxWidth, boxHeight);
      if (box)
        builder.addBox(box);
    } else if (shape === "Torus Pipe") {
      const torusPipe = Simple3dApi.createTorusPipe(torusPipeOuterRadius, torusPipeInnerRadius, torusPipeSweep);
      if (torusPipe)
        builder.addTorusPipe(torusPipe);
    }
    const polyface = builder.claimPolyface(false);
    decoratorState.setColor(color);
    decoratorState.addGeometry(polyface);
    decoratorState.drawBase();
  };

  return (
    <div className="sample-options">
      <div className="sample-grid">
        <LabeledSelect label="Shape:" displayStyle="inline" value={shape} options={shapeOptions} onChange={setShape} />

        {shape === "Sphere" &&
          <Slider min={0} minLabel="Radius" max={10} maxLabel="" step={0.1} values={[sphereRadius]} onChange={(values) => setSphereRadius(values[0])} />}

        {shape === "Box" && <>
          <Slider min={0} minLabel="Length" max={25} maxLabel="" step={0.1} values={[boxLength]} onChange={(values) => setBoxLength(values[0])} />
          <Slider min={0} minLabel="Width" max={25} maxLabel="" step={0.1} values={[boxWidth]} onChange={(values) => setBoxWidth(values[0])} />
          <Slider min={0} minLabel="Height" max={25} maxLabel="" step={0.1} values={[boxHeight]} onChange={(values) => setBoxHeight(values[0])} /></>}

        {shape === "Cone" && <>
          <Slider min={0} minLabel="Upper Radius" max={25} maxLabel="" step={0.1} values={[coneUpperRadius]} onChange={(values) => setConeUpperRadius(values[0])} />
          <Slider min={0} minLabel="Lower Radius" max={25} maxLabel="" step={0.1} values={[coneLowerRadius]} onChange={(values) => setConeLowerRadius(values[0])} />
          <Slider min={0} minLabel="Height" max={25} maxLabel="" step={0.1} values={[coneHeight]} onChange={(values) => setConeHeight(values[0])} /></>}

        {shape === "Torus Pipe" && <>
          <Slider min={0} minLabel="Outer Radius" max={25} maxLabel="" step={0.1} values={[torusPipeOuterRadius]} onChange={(values) => setTorusPipeOuterRadius(values[0])} />
          <Slider min={0} minLabel="Inner Radius" max={25} maxLabel="" step={0.1} values={[torusPipeInnerRadius]} onChange={(values) => setTorusPipeInnerRadius(values[0])} />
          <Slider min={0} minLabel="Sweep" max={360} maxLabel="" step={0.1} values={[torusPipeSweep]} onChange={(values) => setTorusPipeSweep(values[0])} /></>}
      </div>
      <Alert type="informational" className="instructions">Select a shape and adjust dimensions</Alert>
    </div>
  );
};

const shapeOptions = [
  { value: "Box", label: "Box" },
  { value: "Cone", label: "Cone" },
  { value: "Sphere", label: "Sphere" },
  { value: "Torus Pipe", label: "Torus Pipe" },
];

export class Simple3dWidgetProvider implements UiItemsProvider {
  public readonly id: string = "Simple3dWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Bottom) {
      widgets.push(
        {
          id: "Simple3dWidget",
          label: "Simple 3d Controls",
          defaultState: WidgetState.Open,
          getWidgetContent: () => <Simple3dWidget />,
        }
      );
    }
    return widgets;
  }
}
