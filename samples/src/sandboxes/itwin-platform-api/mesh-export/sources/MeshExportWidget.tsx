/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { Alert, Button, ProgressLinear } from "@itwin/itwinui-react";
import "./MeshExport.scss";
import { IModelApp } from "@itwin/core-frontend";
import { MeshExportClient, MeshExportOptions } from "./MeshExportClient";

export const MeshExportWidget = () => {
  type MeshExportExampleState = "NotSubmitted" | "NotStarted" | "InProgress" | "Complete" | "Invalid";
  const [exportState, setExportState] = React.useState<MeshExportExampleState>("NotSubmitted");
  const [resultGltfUrl, setResultGltfUrl] = React.useState("");
  const [resultBinUrl, setResultBinUrl] = React.useState("");

  const startExport = async () => {
    const vp = IModelApp.viewManager.selectedView;
    if (vp?.iModel.iModelId === undefined || !vp.view.isSpatialView())
      throw new Error("Incompatible viewport"); // Need a spatial view of an iModel stored on IModelHub

    const exportOptions: MeshExportOptions = {
      iModelId: vp.iModel.iModelId,
      changesetId: vp.iModel.changeset.id,
      exportType: "GLTF",
      viewDefinitionFilter: {
        categories: Array.from(vp.view.categorySelector.categories),
        models: Array.from(vp.view.modelSelector.models),
        neverDrawn: vp.neverDrawn ? Array.from(vp.neverDrawn) : undefined,
      },
    };

    setExportState("NotStarted");
    const exportId = await MeshExportClient.startExport(exportOptions);
    setTimeout(() => { pollExportStatus(exportId).catch((reason) => console.error(reason)); }, 1000);
  };

  const pollExportStatus = async (exportId: string) => {
    const exportStatus = await MeshExportClient.getExport(exportId);
    if (exportStatus.status === "Invalid")
      throw new Error("Export job is invalid");

    setExportState(exportStatus.status);
    if (exportStatus.gltfUrl)
      setResultGltfUrl(exportStatus.gltfUrl);
    if (exportStatus.binUrl)
      setResultBinUrl(exportStatus.binUrl);
    if (exportStatus.status === "NotStarted" || exportStatus.status === "InProgress")
      setTimeout(() => { pollExportStatus(exportId).catch((reason) => console.error(reason)); }, 1000);
  };

  return (
    <div className="sample-options">
      {exportState === "NotSubmitted" &&
        <Button size="small" styleType="high-visibility" onClick={startExport}>Export to GLTF</Button>
      }
      {(exportState === "NotStarted" || exportState === "InProgress") &&
        <ProgressLinear labels={["Exporting..."]} indeterminate className="loading-state" />
      }
      {(exportState === "Complete") &&
        <Alert clickableText="Download GLTF." clickableTextProps={{ href: resultGltfUrl, download: resultGltfUrl }} type="positive" >
          GLTF Export Complete!
        </Alert>
      }
      {(exportState === "Complete") &&
        <Alert clickableText="Download BIN." clickableTextProps={{ href: resultBinUrl, download: resultBinUrl }} type="positive" >
          BIN Export Complete!
        </Alert>
      }
      <Alert type="informational" className="instructions">Click the button to begin exporting the iModel to GLTF, then download the result (.GLTF and .BIN) once it's available.</Alert>
    </div>
  );
};

export class MeshExportWidgetProvider implements UiItemsProvider {
  public readonly id: string = "MeshExportWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Bottom) {
      widgets.push(
        {
          id: "MeshExportWidget",
          label: "Mesh Export",
          defaultState: WidgetState.Open,
          getWidgetContent: () => <MeshExportWidget />,
        }
      );
    }
    return widgets;
  }
}
