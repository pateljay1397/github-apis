/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { Alert, Button } from "@itwin/itwinui-react";
import { ImageExportApi } from "./ImageExportApi";
import "./ImageExport.scss";

export const ImageExportWidget = () => {

  return (
    <div className="sample-options">
      <Button size="small" styleType="high-visibility" onClick={ImageExportApi.exportImage}>Save as png</Button>
      <Alert type="informational" className="instructions">
        Capture current viewport as an image and download it.
      </Alert>
    </div>
  );
};

export class ImageExportWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ImageExportWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Bottom) {
      widgets.push(
        {
          id: "ImageExportWidget",
          label: "Image Export",
          defaultState: WidgetState.Open,
          getWidgetContent: () => <ImageExportWidget />,
        }
      );
    }
    return widgets;
  }
}
