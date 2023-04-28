/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { useEffect } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { useActiveViewport } from "@itwin/appui-react";
import { assert } from "@itwin/core-bentley";
import { Viewport } from "@itwin/core-frontend";
import { Point3d, Range2d, Transform } from "@itwin/core-geometry";
import { Alert, Button, MenuItem, Slider, SplitButton, Text, ToggleSwitch } from "@itwin/itwinui-react";
import FireDecorationApi from "./FireDecorationApi";
import { FireEmitter } from "./FireDecorator";
import "./FireDecoration.scss";

interface Fire {
  particleNumScale: number;
  height: number;
  effectRange: Range2d; // Assumed to be a square.
  enableSmoke: boolean;
  isOverlay: boolean;
}

const FireDecorationWidget = () => {
  const _defaultFireState: Fire = {
    particleNumScale: 0,
    height: 0,
    effectRange: Range2d.createXYXY(0, 0, 0, 0),
    enableSmoke: false,
    isOverlay: false,
  };
  const _lampElementIds = ["0x3a5", "0x1ab", "0x32b", "0x2ab", "0x22b"];
  const activeViewport = useActiveViewport();
  const [isLoadingState, setIsLoadingState] = React.useState<boolean>(true);
  const [selectedEmitterState, setSelectedEmitterState] = React.useState<FireEmitter>();
  const [paramsNameState, setParamsNameState] = React.useState<string>(FireDecorationApi.predefinedParams.keys().next().value);
  const [fireState, setFireState] = React.useState<Fire>({
    particleNumScale: 0,
    height: 0,
    effectRange: Range2d.createXYXY(0, 0, 0, 0),
    enableSmoke: false,
    isOverlay: false,
  });

  useEffect(() => {
    FireDecorationApi.initTools();

    return () => {
      FireDecorationApi.dispose();
    };
  }, []);

  useEffect(() => {
    if (activeViewport)
      initView(activeViewport).then(() => setIsLoadingState(false))
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error);
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeViewport]);

  useEffect(() => {
    FireDecorationApi.highlightEmitter(selectedEmitterState);
    const currentParams: Fire = selectedEmitterState?.params ?? _defaultFireState;
    setFireState(currentParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmitterState]);

  useEffect(() => {
    if (selectedEmitterState)
      selectedEmitterState.configure(fireState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fireState]);

  const initView = async (viewport: Viewport) => {
    // Query for element origin and bounding box.
    return FireDecorationApi.queryElements(viewport.iModel, _lampElementIds).then(async (results) => {
      const params = FireDecorationApi.predefinedParams.get("Candle") ?? FireDecorationApi.predefinedParams.keys().next().value;
      results.forEach((source, index) => {
        FireDecorationApi.createFireDecorator(source.origin, params, viewport)
          .catch((error) => {
            // eslint-disable-next-line no-console
            console.error(`Error creating predefined[${index}]`, error);
          });
        // If it's the first placed, zoom to it.
        if (index === 0) {
          let volume = source.bBox.clone();
          // Manipulate the volume that the viewport will zoom to.
          // We want the view to be zoomed out (scaling the volume up).
          volume.scaleAboutCenterInPlace(5);
          // We want the element in the bottom half of the view (translate the volume along the positive z(up) axis).
          volume = Transform.createTranslationXYZ(0, 0, volume.zLength() * 0.25).multiplyRange(volume);
          viewport.zoomToVolume(volume);
        }
      });
    });
  };

  /** Starts a tool that will place a new emitter. */
  const startPlacementTool = () => {
    FireDecorationApi.startPlacementTool(async (point: Point3d, viewport: Viewport) => {
      const params = FireDecorationApi.predefinedParams.get(paramsNameState);
      assert(params !== undefined, "Value is set based on keys of map.");
      params.toolTipInfo = paramsNameState;
      const selectedEmitter = await FireDecorationApi.createFireDecorator(point, params, viewport);
      setSelectedEmitterState(selectedEmitter);
    });
  };

  /** Deletes the selected fire decorator emitter. */
  const dropSelected = () => {
    if (selectedEmitterState) {
      FireDecorationApi.dropDecorator(selectedEmitterState);
      selectedEmitterState?.dispose();
      setSelectedEmitterState(undefined);
    }
  };

  /** Deletes all decorators. */
  const dropAllEmitters = () => {
    setSelectedEmitterState(undefined);
    FireDecorationApi.disposeAllEmitters();
  };

  /** Creates a square 2d range with a given length. */
  const createSquareRange2d = (length: number): Range2d => {
    const half = length / 2;
    return Range2d.createXYXY(-half, -half, half, half);
  };

  const noEmitterSelected = selectedEmitterState === undefined;

  const emitters = (close: () => void) => {
    const emitterNames = Array.from(FireDecorationApi.predefinedParams.keys());
    return emitterNames.map((emitter, index) => <MenuItem key={`place-${index}`} onClick={() => { setParamsNameState(emitter); close(); }}>{emitter}</MenuItem>);
  };

  // Display drawing and sheet options in separate sections.
  return (
    <div className="sample-options">
      <div className="sample-grid">
        <SplitButton
          styleType="cta"
          className="place-btn"
          onClick={startPlacementTool}
          menuItems={emitters}>
          Place {paramsNameState}
        </SplitButton>

        <div className="active-emitter-sliders">
          <div className="slider">
            <Text className="slider-label">Particle Density</Text>
            <Slider min={0} max={1} step={0.02} values={[fireState.particleNumScale]} disabled={noEmitterSelected} onUpdate={(values: readonly number[]) => setFireState({ ...fireState, particleNumScale: values[0] })} />
          </div>
          <div className="slider">
            <Text className="slider-label">Height</Text>
            <Slider min={0} max={5} step={0.02} values={[fireState.height]} disabled={noEmitterSelected} onUpdate={(values: readonly number[]) => setFireState({ ...fireState, height: values[0] })} />
          </div>
          <div className="slider">
            <Text className="slider-label">Width</Text>
            {/* The UI of this sample assumes effectRange is a square. */}
            <Slider min={0} max={6} step={0.2} values={[fireState.effectRange.xLength()]} disabled={noEmitterSelected} onUpdate={(values: readonly number[]) => setFireState({ ...fireState, effectRange: createSquareRange2d(values[0]) })} />
          </div>
        </div>

        <div className="buttons">
          <div className="toggles">
            <ToggleSwitch label="Smoke" checked={fireState.enableSmoke} disabled={noEmitterSelected} onChange={(event) => setFireState({ ...fireState, enableSmoke: event.target.checked })} />
            <ToggleSwitch label="Overlay Graphics" checked={fireState.isOverlay} disabled={noEmitterSelected} onChange={(event) => setFireState({ ...fireState, isOverlay: event.target.checked })} />
          </div>
          <Button size="small" disabled={noEmitterSelected} onClick={dropSelected}>Drop Active</Button>
          <Button size="small" disabled={isLoadingState || noEmitterSelected} onClick={() => setSelectedEmitterState(undefined)}>Deselect</Button>
          <Button size="small" styleType="high-visibility" disabled={isLoadingState} onClick={dropAllEmitters}>Drop All</Button>
        </div>
      </div>
      <Alert type="informational" className="instructions">
        Use the "Place" button to create a new fire particle emitter. After placing, use the controls to configure the new emitter.
      </Alert>
    </div>
  );
};

export class FireDecorationWidgetProvider implements UiItemsProvider {
  public readonly id: string = "FireDecorationWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Bottom) {
      widgets.push(
        {
          id: "FireDecorationWidget",
          label: "Fire Decoration Selector",
          defaultState: WidgetState.Open,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <FireDecorationWidget />,
        }
      );
    }
    return widgets;
  }
}
