/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { useActiveViewport } from "@itwin/appui-react";
import { Angle } from "@itwin/core-geometry";
import { Alert, Label, Slider, ToggleSwitch } from "@itwin/itwinui-react";
import { cloneEffectsConfig, EffectsConfig, getCurrentEffectsConfig, updateEffectsConfig } from "./Effects";
import ScreenSpaceEffectsApi from "./ScreenSpaceEffectsApi";
import "./ScreenSpaceEffects.scss";

export const ScreenSpaceEffectsWidget = () => {
  const viewport = useActiveViewport();
  const [lensDistortionState, setLensDistortionState] = React.useState<boolean>(true);
  const [saturationState, setSaturationState] = React.useState<boolean>(true);
  const [vignetteState, setVignetteState] = React.useState<boolean>(true);
  const [effectsConfigState, setEffectsConfigState] = React.useState<EffectsConfig>(getCurrentEffectsConfig());
  const [lensAngleState, setLensAngleState] = React.useState<number>(90);

  useEffect(() => {
    if (!ScreenSpaceEffectsApi._effectsRegistered) {
      ScreenSpaceEffectsApi.registerEffects();
      ScreenSpaceEffectsApi._effectsRegistered = true;
    }
  }, []);

  useEffect(() => {
    if (!viewport)
      return;

    // The lens distortion effect requires the camera to be enabled. Turn it on if it's not already.
    let lensAngle = lensAngleState;
    if (!(viewport.view.is3d() && viewport.isCameraOn))
      viewport.turnCameraOn(Angle.createDegrees(lensAngle));
    else
      lensAngle = viewport.view.camera.getLensAngle().degrees;

    setLensAngleState(lensAngle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewport]);

  // Handle Lens angle change
  useEffect(() => {
    if (!viewport)
      return;

    viewport.turnCameraOn(Angle.createDegrees(lensAngleState));

  }, [viewport, lensAngleState]);

  // Handle distortion, saturation and vignette
  useEffect(() => {
    if (!viewport)
      return;

    // Screen-space effects are applied in the order in which they are added to the viewport.
    // Lens distortion shifts pixels, so we want to apply that first, then saturate, and finally vignette.
    viewport.removeScreenSpaceEffects();
    if (lensDistortionState)
      viewport.addScreenSpaceEffect("Lens Distortion");

    if (saturationState)
      viewport.addScreenSpaceEffect("Saturation");

    if (vignetteState)
      viewport.addScreenSpaceEffect("Vignette");

  }, [viewport, lensDistortionState, saturationState, vignetteState]);

  // Handle EffectsConfigState change
  useEffect(() => {
    if (!viewport)
      return;

    updateEffectsConfig(effectsConfigState);

    viewport.requestRedraw();

  }, [viewport, effectsConfigState]);

  const _onUpdateLensAngle = (values: readonly number[]) => {
    setLensAngleState(values[0]);
  };

  // Create a slider to adjust one of the properties of `EffectsConfig`.
  const createSlider = (label: string,
    value: number,
    min: number,
    max: number,
    step: number,
    enableIf: "saturation" | "lensDistortion" | "vignette",
    update: (newConfig: EffectsConfig, newValue: number) => void) => {

    const updateValue = (values: readonly number[]) => {
      const config = cloneEffectsConfig(effectsConfigState);
      update(config, values[0]);
      setEffectsConfigState(config);
      return { config };
    };

    let state = false;

    switch (enableIf) {
      case "saturation":
        state = saturationState;
        break;
      case "lensDistortion":
        state = lensDistortionState;
        break;
      case "vignette":
        state = vignetteState;
        break;
    }

    return (
      <div>
        <Label>{label}</Label>
        <Slider min={min} max={max} step={step} values={[value]} onUpdate={updateValue} disabled={!state}></Slider>
      </div>
    );
  };

  // When the view is opened, the lens angle can be outside the normal range.  This will leave it unchanged until the user adjusts it.
  const lensAngleMin = 90, lensAngleMax = 160;
  let lensAngleValue = lensAngleState;
  lensAngleValue = Math.min(lensAngleValue, lensAngleMax);
  lensAngleValue = Math.max(lensAngleValue, lensAngleMin);
  return (
    <div className="sample-options">
      <Alert type="informational">
        Use the toggles below to select which effects are applied to the viewport
      </Alert>
      <div className="sample-control">
        <ToggleSwitch label="Saturation" checked={saturationState} onChange={() => setSaturationState(!saturationState)} />
        {createSlider("Multiplier", effectsConfigState.saturation.multiplier, 0, 4, 0.2, "saturation", (config, val) => config.saturation.multiplier = val)}
      </div>
      <div className="sample-control">
        <ToggleSwitch label="Vignette" checked={vignetteState} onChange={() => setVignetteState(!vignetteState)} />
        {createSlider("Size", effectsConfigState.vignette.size, 0, 1, 0.05, "vignette", (config, val) => config.vignette.size = val)}
        {createSlider("Smoothness", effectsConfigState.vignette.smoothness, 0, 1, 0.05, "vignette", (config, val) => config.vignette.smoothness = val)}
        {createSlider("Roundness", effectsConfigState.vignette.roundness, 0, 1, 0.05, "vignette", (config, val) => config.vignette.roundness = val)}
      </div>
      <div className="sample-control">
        <ToggleSwitch label="Lens Distortion" checked={lensDistortionState} onChange={() => setLensDistortionState(!lensDistortionState)} />
        <Label>Lens Angle</Label>
        <Slider min={lensAngleMin} max={lensAngleMax} step={5} values={[lensAngleValue]} disabled={!lensDistortionState} onUpdate={_onUpdateLensAngle} />
        {createSlider("Strength", effectsConfigState.lensDistortion.strength, 0, 1, 0.05, "lensDistortion", (config, val) => config.lensDistortion.strength = val)}
        {createSlider("Cylindrical Ratio", effectsConfigState.lensDistortion.cylindricalRatio, 0, 1, 0.05, "lensDistortion", (config, val) => config.lensDistortion.cylindricalRatio = val)}
      </div>
    </div>
  );
};

export class ScreenSpaceEffectsWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ScreenSpaceEffectsWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "ScreenSpaceEffectsWidget",
          label: "Screen Space Effect Controls",
          defaultState: WidgetState.Open,
          getWidgetContent: () => <ScreenSpaceEffectsWidget />,
        }
      );
    }
    return widgets;
  }
}
