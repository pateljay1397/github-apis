/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { useActiveIModelConnection } from "@itwin/appui-react";
import { ModelProps } from "@itwin/core-common";
import { LoadingSpinner } from "@itwin/core-react";
import { Alert, DropdownButton, Label, MenuItem } from "@itwin/itwinui-react";
import { ModelLists, ViewerOnly2dApi } from "./ViewerOnly2dApi";
import "./ViewerOnly2d.scss";

const ViewerOnly2dWidget = () => {
  const iModelConnection = useActiveIModelConnection();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [selected, setSelected] = React.useState<ModelProps>();
  const [modelLists, setModelLists] = React.useState<ModelLists>(
    {
      sheets: [],
      drawings: [],
    });

  useEffect(() => {
    if (iModelConnection) {
      ViewerOnly2dApi.get2DModels(iModelConnection)
        .then(async (_modelLists) => {
          setModelLists(_modelLists);
          setSelected(_modelLists.drawings[0] ?? _modelLists.sheets[0]);
          return ViewerOnly2dApi.getInitial2DModel(iModelConnection, _modelLists.drawings, _modelLists.sheets);
        })
        .then((initial) => {
          ViewerOnly2dApi.changeViewportView(iModelConnection, initial)
            .catch((error) => {
              console.error(error);
            });
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [iModelConnection]);

  useEffect(() => {
    if (selected && iModelConnection) {
      setIsLoading(true);
      ViewerOnly2dApi.changeViewportView(iModelConnection, selected)
        .catch((error) => {
          console.error(error);
        }).finally(() => {
          setIsLoading(false);
        });
    }
  }, [iModelConnection, selected, modelLists.drawings, modelLists.sheets]);

  const dropdownMenuItems = (close: () => void) => [
    <MenuItem key="drawings"
      subMenuItems={modelLists.drawings.map((drawing, index) => <MenuItem key={index} onClick={() => { setSelected(drawing); close(); }}>{drawing.name}</MenuItem>)}
    >
      Drawings
    </MenuItem>,
    <MenuItem key="sheets"
      subMenuItems={modelLists.sheets.map((sheet, index) => <MenuItem key={index} onClick={() => { setSelected(sheet); close(); }}>{sheet.name}</MenuItem>)}
    >
      Sheets
    </MenuItem>,
  ];

  // Display drawing and sheet options in separate sections.
  return (
    <div className="sample-options">
      <div className="sample-options-selector">
        <Label>Select Drawing or Sheet</Label>
        <DropdownButton menuItems={dropdownMenuItems} className="sample-dropdown-button">{selected?.name}</DropdownButton>
        {isLoading && <LoadingSpinner size="small" />}
      </div>
      <Alert type="informational" className="instructions">
        The selector shows a list of 2D models in this iModel.
      </Alert>
    </div>
  );
};

export class ViewerOnly2dWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ViewerOnly2dWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Bottom) {
      widgets.push(
        {
          id: "ViewerOnly2dWidget",
          label: "2D View Selector",
          defaultState: WidgetState.Open,
          getWidgetContent: () => <ViewerOnly2dWidget />,
        });
    }
    return widgets;
  }
}
