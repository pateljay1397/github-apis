/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { useActiveViewport } from "@itwin/appui-react";
import { IModelApp, Viewport } from "@itwin/core-frontend";
import { Alert, ToggleSwitch } from "@itwin/itwinui-react";
import MultiViewportApi from "./MultiViewportApi";
import "./multi-view-sample.scss";

const MultiViewportWidget = () => {
  const viewport = useActiveViewport();
  const [isSynched, setIsSynched] = React.useState<boolean>();

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
      // By passing the selected viewport as the first argument, this will be the view
      //  used to override the second argument's view.
      MultiViewportApi.connectViewports(selectedViewport, unselectedViewport);
    } else {
      MultiViewportApi.disconnectViewports();
    }
  }, [viewport, isSynched]);

  // Display drawing and sheet options in separate sections.
  return (
    <div className="sample-options">
      <div className="sample-grid">
        <ToggleSwitch label="Sync Viewports" disabled={viewport === undefined} checked={isSynched} onChange={() => setIsSynched(!isSynched)} />
        <Alert type="informational">
          Use the controls at the top-right to navigate the model.
          Toggle to sync the viewports in the controls below.
          Navigating will not change the selected viewport.
        </Alert>
      </div>
    </div>
  );
};

export class MultiViewportWidgetProvider implements UiItemsProvider {
  public readonly id: string = "MultiViewportWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Bottom) {
      widgets.push(
        {
          id: "MultiViewportWidget",
          label: "Multi Viewport Selector",
          defaultState: WidgetState.Open,
          getWidgetContent: () => <MultiViewportWidget />,
        }
      );
    }
    return widgets;
  }
}
