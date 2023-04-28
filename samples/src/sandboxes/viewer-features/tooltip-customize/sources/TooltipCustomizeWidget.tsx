/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { useEffect } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { Alert, LabeledInput, ToggleSwitch } from "@itwin/itwinui-react";
import { toolAdmin, TooltipCustomizeSettings } from "./TooltipCustomizeApi";
import "./TooltipCustomize.scss";

/**
 * Tooltip customize widget
 */
export const TooltipCustomizeWidget = () => {
  const [settingsState, setSettingsState] = React.useState<TooltipCustomizeSettings>(toolAdmin.settings);

  // Updates the tooltip settings each time ui changes
  useEffect(() => {
    toolAdmin.settings = settingsState;
  }, [settingsState]);

  // Creates a toggle for each boolean value in the settingState plus an input field for settingState.customText
  return (
    <div className="sample-options">
      <div className="sample-grid">
        <ToggleSwitch
          label="Show Default ToolTip"
          checked={settingsState.showDefaultToolTip}
          onChange={() => setSettingsState((state) => ({ ...state, showDefaultToolTip: !state.showDefaultToolTip }))} />
        <ToggleSwitch
          label="Show Image"
          checked={settingsState.showImage}
          onChange={() => setSettingsState((state) => ({ ...state, showImage: !state.showImage }))} />
        <ToggleSwitch
          label="Show Presentation Label"
          checked={settingsState.showPresentationLabel}
          onChange={() => setSettingsState((state) => ({ ...state, showPresentationLabel: !state.showPresentationLabel }))} />
        <ToggleSwitch
          label="Show Custom Text"
          checked={settingsState.showCustomText}
          onChange={() => setSettingsState((state) => ({ ...state, showCustomText: !state.showCustomText }))} />
        <LabeledInput
          className="sample-grid-control"
          displayStyle="inline"
          label="Custom Text"
          type="text"
          value={settingsState.customText}
          onChange={(event) => setSettingsState({ ...settingsState, customText: event.target.value })}
          disabled={!settingsState.showCustomText} />
      </div>
      <Alert type="informational" className="instructions">
        Hover the mouse pointer over an element to see the tooltip. Use these options to control it
      </Alert>
    </div>
  );
};

/**
 * Tooltip customize widget provider
 */
export class TooltipCustomizeWidgetProvider implements UiItemsProvider {
  public readonly id: string = "TooltipCustomizeWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Bottom) {
      widgets.push(
        {
          id: "TooltipCustomizeWidget",
          label: "Tooltip Customize Selector",
          defaultState: WidgetState.Open,
          getWidgetContent: () => <TooltipCustomizeWidget />,
        }
      );
    }
    return widgets;
  }
}
