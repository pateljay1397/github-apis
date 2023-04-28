/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import React from "react";
import { ElementPickerWidget } from "./widgets/ElementPickerWidget";
import { DetailsWidget } from "./widgets/DetailsWidget";

export class SelectionScopeWidgetProvider implements UiItemsProvider {
  public readonly id: string = "SelectionScopeWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Bottom) {
      widgets.push(
        {
          id: "ElementPickerWidget",
          label: "Element Picker",
          defaultState: WidgetState.Open,
          getWidgetContent: () => (
            <ElementPickerWidget/>),
        }
      );
    }
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "DetailsWidget",
          label: "Details",
          defaultState: WidgetState.Hidden,
          getWidgetContent: () => (
            <DetailsWidget/>),
        }
      );
    }
    return widgets;
  }
}
