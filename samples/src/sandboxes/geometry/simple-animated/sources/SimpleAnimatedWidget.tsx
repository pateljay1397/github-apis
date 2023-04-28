/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useCallback, useEffect } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { ColorDef } from "@itwin/core-common";
import { IModelApp } from "@itwin/core-frontend";
import { ColorPickerButton } from "@itwin/imodel-components-react";
import { Alert, Label, LabeledSelect } from "@itwin/itwinui-react";
import { ConwayHelpers } from "./ConwaysGameOfLife";
import SimpleAnimatedApi, { AnimatedGeometryDecorator } from "./SimpleAnimatedApi";
import "./SimpleAnimated.scss";

export const SimpleAnimatedWidget = () => {
  const [decoratorState, setDecoratorState] = React.useState<AnimatedGeometryDecorator>();
  const [grid, setGrid] = React.useState<boolean[][]>(ConwayHelpers.generateGrid());
  const [delay, setDelay] = React.useState<number>(1000 / 5);
  const [color, setColor] = React.useState<ColorDef>(ColorDef.fromString("yellow"));

  const showNextFrame = useCallback(() => {
    const newGrid = ConwayHelpers.updateGrid(grid);
    setGrid(newGrid);
  }, [grid]);

  useEffect(() => {
    if (!decoratorState) {
      const decorator = new AnimatedGeometryDecorator();
      IModelApp.viewManager.addDecorator(decorator);
      setDecoratorState(decorator);
    }

    return (() => {
      if (decoratorState)
        IModelApp.viewManager.dropDecorator(decoratorState);
    });
  }, [decoratorState]);

  useEffect(() => {
    if (!decoratorState)
      return;

    decoratorState.clearGeometry();
    decoratorState.setColor(ColorDef.white);
    decoratorState.setFill(true);
    decoratorState.setFillColor(color);
    decoratorState.setLineThickness(2);
    const graphicalGrid = SimpleAnimatedApi.createGridSquares(grid);
    for (const square of graphicalGrid)
      decoratorState.addGeometry(square);

    IModelApp.viewManager.invalidateDecorationsAllViews();
  }, [color, grid, decoratorState]);

  useEffect(() => {
    if (decoratorState)
      decoratorState.setAnimationCallback(showNextFrame, delay);
  }, [delay, decoratorState, showNextFrame]);

  const speeds = [
    { label: "Fast (50 Hz)", value: 1000 / 50 },
    { label: "Medium (5 Hz)", value: 1000 / 5 },
    { label: "Slow (1 Hz)", value: 1000 },
  ];

  return (
    <div className="sample-options">
      <div className="sample-grid">
        <div className="color-picker">
          <Label displayStyle="inline">Color:</Label>
          <ColorPickerButton initialColor={color} onColorPick={(newColor: ColorDef) => setColor(newColor)} />
        </div>
        <LabeledSelect
          displayStyle="inline"
          label="Update Speed:"
          size="small"
          options={speeds}
          value={delay}
          onChange={(val) => setDelay(val)} />
      </div>
      <Alert type="informational" className="instructions">An implementation of Conway's game of life</Alert>
    </div>
  );
};

export class SimpleAnimatedWidgetProvider implements UiItemsProvider {
  public readonly id: string = "SimpleAnimatedWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Bottom) {
      widgets.push(
        {
          id: "SimpleAnimatedWidget",
          label: "Simple Animated Controls",
          defaultState: WidgetState.Open,
          getWidgetContent: () => <SimpleAnimatedWidget />,
        }
      );
    }
    return widgets;
  }
}
