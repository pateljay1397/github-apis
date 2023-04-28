/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { ColorDef } from "@itwin/core-common";
import { EmphasizeElements, IModelApp } from "@itwin/core-frontend";
import { ColorPickerButton } from "@itwin/imodel-components-react";
import { Alert, Button, Text } from "@itwin/itwinui-react";
import { ISelectionProvider, Presentation, SelectionChangeEventArgs } from "@itwin/presentation-frontend";
import { EmphasizeElementsApi } from "./EmphasizeElementsApi";
import "./EmphasizeElements.scss";

enum ActionType {
  Emphasize = "Emphasize",
  Isolate = "Isolate",
  Hide = "Hide",
  Override = "Color",
}

export const EmphasizeElementsWidget = () => {
  // START WIDGET_SETUP
  const [selectionIsEmptyState, setSelectionIsEmptyState] = React.useState<boolean>(true);
  const [emphasizeIsActiveState, setEmphasizeIsActiveState] = React.useState<boolean>(false);
  const [hideIsActiveState, setHideIsActiveState] = React.useState<boolean>(false);
  const [isolateIsActiveState, setIsolateIsActiveState] = React.useState<boolean>(false);
  const [overrideIsActiveState, setOverrideIsActiveState] = React.useState<boolean>(false);
  const [colorValueState, setColorValueState] = React.useState<ColorDef>(ColorDef.red);

  useEffect(() => {
    Presentation.selection.selectionChange.addListener(_onSelectionChanged);

    /** This function is called when the widget is destroyed, similar to ComponentWillUnmount */
    return () => {
      const vp = IModelApp.viewManager.selectedView;

      if (undefined === vp)
        return;

      const provider = EmphasizeElements.getOrCreate(vp);
      provider.clearEmphasizedElements(vp);
      provider.clearHiddenElements(vp);
      provider.clearIsolatedElements(vp);
      provider.clearOverriddenElements(vp);
    };
  }, []);
  // END WIDGET_SETUP

  const _onSelectionChanged = (evt: SelectionChangeEventArgs, selectionProvider: ISelectionProvider) => {
    const selection = selectionProvider.getSelection(evt.imodel, evt.level);
    setSelectionIsEmptyState(selection.isEmpty);
  };

  const _onColorPick = (colorValue: ColorDef) => {
    setColorValueState(colorValue);
  };

  // START ON_CLICK_ACTION
  const _handleActionButton = (type: ActionType) => {
    const vp = IModelApp.viewManager.selectedView;

    if (undefined === vp)
      return;

    switch (type) {
      default:
      case ActionType.Emphasize: {
        EmphasizeElementsApi.emphasizeSelectedElements(vp);
        setEmphasizeIsActiveState(true);
        break;
      }
      case ActionType.Isolate: {
        EmphasizeElementsApi.isolateSelectedElements(vp);
        setIsolateIsActiveState(true);
        break;
      }
      case ActionType.Hide: {
        EmphasizeElementsApi.hideSelectedElements(vp);
        setHideIsActiveState(true);
        break;
      }
      case ActionType.Override: {
        EmphasizeElementsApi.overrideSelectedElements(colorValueState, vp);
        setOverrideIsActiveState(true);
        break;
      }
    }
  };
  // END ON_CLICK_ACTION

  // START ON_CLICK_CLEAR
  const _handleClearButton = (type: ActionType) => {
    const vp = IModelApp.viewManager.selectedView;

    if (undefined === vp)
      return;

    switch (type) {
      default:
      case ActionType.Emphasize: {
        EmphasizeElementsApi.clearEmphasizedElements(vp);
        setEmphasizeIsActiveState(false);
        break;
      }
      case ActionType.Isolate: {
        EmphasizeElementsApi.clearIsolatedElements(vp);
        setIsolateIsActiveState(false);
        break;
      }
      case ActionType.Hide: {
        EmphasizeElementsApi.clearHiddenElements(vp);
        setHideIsActiveState(false);
        break;
      }
      case ActionType.Override: {
        EmphasizeElementsApi.clearOverriddenElements(vp);
        setOverrideIsActiveState(false);
        break;
      }
    }
  };
  // END ON_CLICK_CLEAR

  return (
    // START CONTROLS
    <div className="sample-options">
      <div className="sample-grid">
        <div className="control">
          <Text>Emphasize</Text>
          <span />
          <Button size="small" styleType="cta" onClick={() => _handleActionButton(ActionType.Emphasize)} disabled={selectionIsEmptyState}>Apply</Button>
          <Button size="small" styleType="cta" onClick={() => _handleClearButton(ActionType.Emphasize)} disabled={!emphasizeIsActiveState}>Clear</Button>
        </div>
        <div className="control">
          <Text>Hide</Text>
          <span />
          <Button size="small" styleType="cta" onClick={() => _handleActionButton(ActionType.Hide)} disabled={selectionIsEmptyState}>Apply</Button>
          <Button size="small" styleType="cta" onClick={() => _handleClearButton(ActionType.Hide)} disabled={!hideIsActiveState}>Clear</Button>

        </div>
        <div className="control">
          <Text>Isolate</Text>
          <span />
          <Button size="small" styleType="cta" onClick={() => _handleActionButton(ActionType.Isolate)} disabled={selectionIsEmptyState}>Apply</Button>
          <Button size="small" styleType="cta" onClick={() => _handleClearButton(ActionType.Isolate)} disabled={!isolateIsActiveState}>Clear</Button>
        </div>
        <div className="control">
          <Text>Override</Text>
          <ColorPickerButton initialColor={colorValueState} onColorPick={_onColorPick} disabled={selectionIsEmptyState} />
          <Button size="small" styleType="cta" onClick={() => _handleActionButton(ActionType.Override)} disabled={selectionIsEmptyState}>Apply</Button>
          <Button size="small" styleType="cta" onClick={() => _handleClearButton(ActionType.Override)} disabled={!overrideIsActiveState}>Clear</Button>
        </div>
      </div>
      <Alert type="informational" className="instructions">
        Select one or more elements. Click one of the Apply buttons
      </Alert>
    </div>
    // END CONTROLS
  );
};

export class EmphasizeElementsWidgetProvider implements UiItemsProvider {
  public readonly id: string = "EmphasizeElementsWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Bottom) {
      widgets.push(
        {
          id: "EmphasizeElementsWidget",
          label: "Emphasize Elements Selector",
          defaultState: WidgetState.Open,
          getWidgetContent: () => <EmphasizeElementsWidget />,
        }
      );
    }
    return widgets;
  }

}
