/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { useActiveFrontstageId, useActiveViewport } from "@itwin/appui-react";
import { IModelApp, ViewManip, Viewport } from "@itwin/core-frontend";
import { Alert, LabeledTextarea, ToggleSwitch } from "@itwin/itwinui-react";
import TransformationsApi from "./TransformationsApi";
import TransformationsClient from "./TransformationsClient";

const TransformationsWidget = () => {
  const viewport = useActiveViewport();
  const [isSynched, setIsSynched] = React.useState<boolean>(true);
  const [transformationResponse, setTransformationResponse] = React.useState<string>("Loading...");
  const frontstageId = useActiveFrontstageId();

  useEffect(() => {
    (async () => {
      const transformationResp = await TransformationsClient.getTransformation(TransformationsApi.Transformation_Id);

      if (transformationResp !== undefined)
        setTransformationResponse(JSON.stringify(transformationResp, null, 2));
      else
        setTransformationResponse("Invalid Response");
    })()
      .catch((error) => {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    if (viewport) {
      for (const vp of IModelApp.viewManager) {
        if (vp.viewportId % 2 === 0)
          requestAnimationFrame(() => ViewManip.fitView(vp, false, { noSaveInUndo: true }));
      }
    }
  }, [viewport, frontstageId]);

  // START SYNC
  // Handle changes to the UI sync toggle.
  useEffect(() => {
    if (isSynched && viewport !== undefined) {
      let selectedViewport: Viewport | undefined, unselectedViewport: Viewport | undefined;
      for (const vp of IModelApp.viewManager) {
        if (vp.viewportId === viewport.viewportId)
          selectedViewport = vp;
        else
          unselectedViewport = vp;
      }
      if (selectedViewport === undefined || unselectedViewport === undefined)
        return;
      TransformationsApi.connectViewports(selectedViewport, unselectedViewport);
    } else if (!isSynched) {
      TransformationsApi.disconnectViewports();
    }
  }, [viewport, isSynched]);
  // END SYNC

  // Display drawing and sheet options in separate sections.
  return (
    <div className="sample-container">
      <div className="sample-options">
        <Alert type="informational" className="no-icon">
          Use the controls at the top-right to navigate the model. Toggle to sync the viewports in the controls below. Navigating will not change the selected viewport.
        </Alert>
        <ToggleSwitch
          label="Sync Viewports"
          labelPosition="right"
          disabled={viewport === undefined}
          checked={isSynched}
          onChange={() => setIsSynched(!isSynched)}
          className="sample-options-block" />
        <LabeledTextarea
          label="Transformation Response"
          spellCheck="false"
          value={transformationResponse} />
      </div>
    </div>
  );
};

export class TransformationsWidgetProvider implements UiItemsProvider {
  public readonly id: string = "TransformationsWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "TransformationsWidget",
          label: "Transformations Selector",
          defaultState: WidgetState.Open,
          getWidgetContent: () => <TransformationsWidget />,
        }
      );
    }
    return widgets;
  }
}
