/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { Alert } from "@itwin/itwinui-react";

export const InstructionsWidget = () => {
  return (
    <Alert type="informational" style={{ margin: "16px" }}>
      This is the default tree, allowing for the nesting of nodes within other nodes, which can be expanded or collapsed
    </Alert >
  );
};

export class InstructionsWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ToolbarButtonInstructionsWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Bottom && _section === StagePanelSection.Start) {
      widgets.push(
        {
          id: "ToolbarButtonInstructionsWidget",
          label: "Instructions",
          defaultState: WidgetState.Open,
          getWidgetContent: () => <InstructionsWidget />,
        }
      );
    }
    return widgets;
  }
}
