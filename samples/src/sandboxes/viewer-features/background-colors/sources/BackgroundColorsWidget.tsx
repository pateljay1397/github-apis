/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { useActiveViewport } from "@itwin/appui-react";
import React, { useEffect } from "react";
import { ColorDef, DisplayStyle3dSettingsProps } from "@itwin/core-common";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { Alert, Label, LabeledSelect, SelectOption } from "@itwin/itwinui-react";
import { AlphaSlider, ColorPickerButton } from "@itwin/imodel-components-react";

import { backgroundPresets, BackgroundPresets } from "./BackgroundColorsPresets";
import BackgroundColorsApi from "./BackgroundColorsApi";

import "./BackgroundColors.scss";

type Modes = "One" | "Two" | "Four";
const MODES: Modes[] = ["One", "Two", "Four"];

interface ColorTargets {
  backgroundColor: ColorDef;
  nadirColor: ColorDef;
  groundColor: ColorDef;
  skyColor: ColorDef;
  zenithColor: ColorDef;
}

const INITIAL_ALPHA = 0.5;
const INITIAL_COLORS = {
  backgroundColor: ColorDef.blue.withAlpha(INITIAL_ALPHA * 255),
  nadirColor: ColorDef.fromTbgr(61325),
  skyColor: ColorDef.fromTbgr(5431),
  groundColor: ColorDef.fromTbgr(94154),
  zenithColor: ColorDef.fromTbgr(72351),
};

const getMode = (setting: DisplayStyle3dSettingsProps) => {
  if (setting?.environment?.sky?.twoColor) {
    return "Two";
  } else if (setting?.environment?.sky?.display) {
    return "Four";
  } else {
    return "One";
  }
};

const selectOptionsValueMapper = <T,>(values: any[]): SelectOption<T>[] => values.map((val: any) => ({
  value: val,
  label: val,
}));

export const BackgroundColorsWidget: React.FunctionComponent = () => {
  const viewport = useActiveViewport();
  const [mode, setMode] = React.useState<Modes>("One");
  const [activePreset, setActivePreset] = React.useState<BackgroundPresets>("Custom");
  const [alphaSlider, setAlphaSlider] = React.useState<number>(INITIAL_ALPHA);
  const [colorValueStates, setColorValueStates] = React.useState<ColorTargets>({ ...INITIAL_COLORS });

  // Apply background color changes
  useEffect(() => {
    const { backgroundColor, nadirColor, skyColor, groundColor, zenithColor } = { ...colorValueStates };

    if (viewport) {
      switch (mode) {
        case "One":
          BackgroundColorsApi.applySingleColor(viewport, backgroundColor.withAlpha(alphaSlider * 255).toJSON());
          break;
        case "Two":
          BackgroundColorsApi.applyTwoColorGradient(viewport, { zenithColor, nadirColor });
          break;
        case "Four":
          BackgroundColorsApi.applyFourColorGradient(viewport, { zenithColor, nadirColor, skyColor, groundColor });
          break;
      }
    }

  }, [viewport, activePreset, colorValueStates, mode, alphaSlider]);

  // Update Colors and Mode on Preset Change
  useEffect(() => {
    // Retain prior settings when "Custom" selected
    if (activePreset === "Custom") {
      return;
    }

    // Reset AlphaSlider for single color settings
    if (activePreset === "1 Color - Purple") {
      setAlphaSlider(1);
    } else if (activePreset === "1 Color - Transparent") {
      setAlphaSlider(0.5);
    }

    const preset = backgroundPresets[activePreset];
    setColorValueStates((prev) => ({
      ...prev,
      backgroundColor: ColorDef.fromJSON(preset?.backgroundColor),
      nadirColor: ColorDef.fromJSON(preset?.environment?.sky?.nadirColor),
      zenithColor: ColorDef.fromJSON(preset?.environment?.sky?.zenithColor),
      skyColor: ColorDef.fromJSON(preset?.environment?.sky?.skyColor),
      groundColor: ColorDef.fromJSON(preset?.environment?.sky?.groundColor),
    }));

    setMode(getMode(preset));

  }, [activePreset]);

  // Change transparency value for single color option
  const _onAlphaChange = (a: number) => {
    // Scale alpha value from [0:1] slider range to [0:255] for ColorDef requirements
    const backgroundColorWithAlpha = colorValueStates.backgroundColor.withAlpha(a * 255);
    setAlphaSlider(a);
    setColorValueStates({ ...colorValueStates, backgroundColor: backgroundColorWithAlpha });
  };

  // Change color options
  const _onColorPick = (colorValue: ColorDef, target: keyof ColorTargets) => {
    setColorValueStates({ ...colorValueStates, [target]: colorValue });
    setActivePreset("Custom");
  };

  // Change number of colors mode option
  const _onModeChange = (value: Modes) => {
    setMode(value);
    setActivePreset("Custom");
  };

  // Change selected background preset
  const _onPresetChange = (value: BackgroundPresets) => {
    setActivePreset(value);
  };

  const optionsPresets = (() => selectOptionsValueMapper<BackgroundPresets>(Object.keys(backgroundPresets)))();
  const optionsModes = (() => selectOptionsValueMapper<Modes>(MODES))();

  return (
    <div className="sample-options">
      <div className="sample-options-container">
        <LabeledSelect size="small" displayStyle="inline" label="Preset:" value={activePreset} onChange={_onPresetChange} style={{ width: "fit-content" }} options={optionsPresets} />
        <LabeledSelect size="small" displayStyle="inline" label="Number of Colors:" value={mode} onChange={_onModeChange} style={{ width: "fit-content" }} options={optionsModes} />
        <div className="sample-grid">
          {mode === "One" &&
            <>
              <div className="label-container">
                <Label>Background</Label>
                <ColorPickerButton initialColor={colorValueStates.backgroundColor} onColorPick={(colorValue) => _onColorPick(colorValue.withAlpha(alphaSlider * 255), "backgroundColor")} />
              </div>
              <div className="label-container">
                <Label>Transparency</Label>
                <AlphaSlider alpha={alphaSlider} isHorizontal onAlphaChange={_onAlphaChange}>Transparency</AlphaSlider>
              </div>
            </>
          }
          {(mode === "Two" || mode === "Four") &&
            <>
              <div className="label-container">
                <ColorPickerButton initialColor={colorValueStates.nadirColor} onColorPick={(colorValue) => _onColorPick(colorValue, "nadirColor")} disabled={false} />
                <Label>Nadir</Label>
              </div>
              <div className="label-container">
                <ColorPickerButton initialColor={colorValueStates.zenithColor} onColorPick={(colorValue) => _onColorPick(colorValue, "zenithColor")} disabled={false} />
                <Label>Zenith</Label>
              </div>
              {mode === "Four" &&
                <>
                  <div className="label-container">
                    <ColorPickerButton initialColor={colorValueStates.groundColor} onColorPick={(colorValue) => _onColorPick(colorValue, "groundColor")} disabled={false} />
                    <Label>Ground</Label>
                  </div>
                  <div className="label-container">
                    <ColorPickerButton initialColor={colorValueStates.skyColor} onColorPick={(colorValue) => _onColorPick(colorValue, "skyColor")} disabled={false} />
                    <Label>Sky</Label>
                  </div>
                </>
              }
            </>
          }
        </div>
      </div>
      <Alert type="informational" className="instructions">
        Use the dropdowns to change the background styles and number of color gradients. Use the color pickers to customize the color.
      </Alert>
    </div>
  );
};

export class BackgroundColorsWidgetProvider implements UiItemsProvider {
  public readonly id: string = "BackgroundColorsWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Bottom) {
      widgets.push(
        {
          id: "BackgroundColorsWidget",
          label: "Background Colors Selector",
          defaultState: WidgetState.Open,
          getWidgetContent: () => <BackgroundColorsWidget />,
        }
      );
    }
    return widgets;
  }

}
