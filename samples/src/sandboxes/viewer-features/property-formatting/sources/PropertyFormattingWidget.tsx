/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { FunctionComponent } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { useActiveIModelConnection } from "@itwin/appui-react";
import { Alert } from "@itwin/itwinui-react";
import { UnifiedSelectionContextProvider } from "@itwin/presentation-components";
import { PropertyGridComponent } from "./PropertyGridComponent";
import { PropertyTableWidget } from "./PropertyTableWidget";
import "./PropertyFormatting.scss";

const UnifiedSelection: FunctionComponent = ({ children }) => {
  const imodel = useActiveIModelConnection();

  if (!imodel)
    return null;

  return (
    <UnifiedSelectionContextProvider imodel={imodel}>
      {children}
    </UnifiedSelectionContextProvider>
  );
};

const PropertyFormattingWidget: FunctionComponent  = () => {
  return (
    <div className="sample-options">
      <div className="sample-grid">
        <Alert type="informational" className="instructions">
          Select an element in the view and choose an approach to display its properties.
        </Alert>
        <PropertyGridComponent />
      </div>
    </div>
  );
};

export class PropertyFormattingWidgetProvider implements UiItemsProvider {
  public readonly id: string = "PropertyFormattingWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "PropertyFormattingWidget",
          label: "Property Formatting Selector",
          defaultState: WidgetState.Open,
          getWidgetContent: () => (
            <UnifiedSelection>
              <PropertyFormattingWidget />
            </UnifiedSelection>),
        }
      );
    }
    if (location === StagePanelLocation.Bottom) {
      widgets.push(
        {
          id: "PropertyTableFormattingWidget",
          label: "Property Table",
          defaultState: WidgetState.Open,
          getWidgetContent: () => (
            <UnifiedSelection>
              <PropertyTableWidget />
            </UnifiedSelection>),
        }
      );
    }
    return widgets;
  }
}
