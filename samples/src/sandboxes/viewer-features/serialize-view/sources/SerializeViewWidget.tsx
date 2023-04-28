/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { ModalDialogManager } from "@itwin/appui-react";
import { ViewStateProps } from "@itwin/core-common";
import { IModelApp, ScreenViewport } from "@itwin/core-frontend";
import { Dialog } from "@itwin/core-react";
import { Alert, Button, LabeledSelect, SelectOption, Small } from "@itwin/itwinui-react";
import { JsonViewerWidget } from "./JsonViewerWidget";
import { IModelViews, sampleViewStates, ViewStateWithName } from "./SampleViewStates";
import SerializeViewApi from "./SerializeViewApi";
import "./SerializeView.scss";

export const SerializeViewWidget = () => {
  const viewport = IModelApp.viewManager.selectedView;
  const allSavedViews: IModelViews[] = [...sampleViewStates];
  const [currentViewIndexState, setCurrentViewIndexState] = React.useState<number>(0);
  const [viewsState, setViewsState] = React.useState<ViewStateWithName[]>([]);
  const [optionsState, setOptionsState] = React.useState<SelectOption<number>[]>([]);
  const [jsonViewerTitleState, setJsonViewerTitleState] = React.useState<string>("");
  const [jsonMenuValueState, setJsonMenuValueState] = React.useState<string>("");
  const [loadStateError, setLoadStateError] = React.useState<string | undefined>("");

  useEffect(() => {
    if (viewport)
      _init(viewport);
    else
      IModelApp.viewManager.onViewOpen.addOnce((_vp: ScreenViewport) => _init(_vp));

    return () => {
      ModalDialogManager.closeDialog();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewport]);

  useEffect(() => {
    if (viewsState.length === 0)
      return;

    setJsonViewerTitleState(viewsState[currentViewIndexState].name);
    setJsonMenuValueState(JSON.stringify(viewsState[currentViewIndexState].view, null, 2));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentViewIndexState]);

  const _init = (vp: ScreenViewport) => {
    /** Grab the IModel with views that match the imodel loaded. */
    const iModelWithViews = allSavedViews.filter((iModelViews) => {
      return iModelViews.iModelId === vp.iModel.iModelId;
    });

    /** Grab the views of the iModel just loaded and load the first view state in the SampleViewStates.ts */
    const views = iModelWithViews.length > 0 ? iModelWithViews[0].views : [];

    /** Prettify the json string */
    const menuValue = undefined !== views[currentViewIndexState] ?
      JSON.stringify(views[currentViewIndexState].view, null, 2)
      : "No View Selected";

    const title = undefined !== views[currentViewIndexState] ? views[currentViewIndexState].name : "";

    /** Set the views for the imodel in the state */
    setViewsState(views);
    setOptionsState(getOptions(views));
    setJsonViewerTitleState(title);
    setJsonMenuValueState(menuValue);
  };

  const _onSaveStateClick = () => {
    const currentImodelId = viewport?.iModel?.iModelId;
    /** Check that the viewport is not null, and there is an iModel loaded with an ID */
    if (viewport !== undefined && currentImodelId !== undefined) {

      /** Serialize the current view */
      const viewStateProps = SerializeViewApi.serializeCurrentViewState(viewport);

      /** Add that serialized view to the list of views to select from */
      const views = [...viewsState, { name: `Saved View: ${viewsState.length + 1}`, view: viewStateProps }];
      setViewsState(views);
      setOptionsState(getOptions(views));
      setCurrentViewIndexState(viewsState.length);
    }
  };

  /** Loads the view selected */
  const _onLoadStateClick = () => {
    if (viewport) {

      /** Close the dialog box if switching views */
      _handleDialogClose();

      const view = viewsState[currentViewIndexState].view;

      /** Load the view state. Display error message if there is one */
      SerializeViewApi.loadViewState(viewport, view)
        .then(() => {
          if (loadStateError) {
            setLoadStateError("");
          }
        })
        .catch(() => {
          setLoadStateError(`Error changing view: invalid view state.`);
        });
    }
  };

  /** Gets the options for the dropdown menu to select views */
  const getOptions = (views: ViewStateWithName[]): SelectOption<number>[] => {
    return views.map((viewStateWithName: ViewStateWithName, index: number) => {
      return { label: viewStateWithName.name, value: index };
    });
  };

  /** Helper method for showing an error */
  const showError = (stateProp: string | undefined) => {
    if (!stateProp) {
      return (<div></div>);
    }

    return (
      <div style={{ overflowWrap: "break-word" }}>
        <Small style={{ color: "var(--foreground-alert)" }}>
          ${stateProp}
        </Small>
      </div>
    );
  };

  /** Called when user selects 'Save View' */
  const _onSaveJsonViewClick = async (json: string) => {
    if (viewport) {
      const viewStateProps = JSON.parse(json) as ViewStateProps;
      setJsonMenuValueState(json);
      const views = [...viewsState];
      if (undefined !== viewStateProps) {
        views[currentViewIndexState].view = viewStateProps;
        setViewsState(views);
      }
    }
  };

  // Helper method to get the offset position of an element on the browser
  const getOffset = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    return {
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY,
      bottom: rect.bottom,
    };
  };

  const _openDialog = () => {
    const offset = getOffset(viewport!.canvas);
    ModalDialogManager.openDialog(
      <Dialog
        opened={true}
        modal={false}
        onClose={_handleDialogClose}
        resizable={true}
        movable={true}
        title={jsonViewerTitleState}
        width={400}

        // This is specific for this sample-showcase, the better approach is to use the
        // 'alignment' prop to specify the initial location on screen
        x={offset.left + 20}
        y={offset.bottom - 380}
      >
        <JsonViewerWidget
          json={jsonMenuValueState}
          onSaveJsonViewClick={_onSaveJsonViewClick} />
      </Dialog>);
  };

  const _handleDialogClose = () => {
    ModalDialogManager.closeDialog();
  };

  return (
    <div className="sample-options">
      <div className="sample-grid">
        <LabeledSelect label="Select View:" options={optionsState} onChange={(num) => setCurrentViewIndexState(num)} disabled={viewsState.length === 0} value={currentViewIndexState} onShow={undefined} onHide={undefined} />
        <Button onClick={_onLoadStateClick} disabled={viewsState.length === 0}>Load State</Button>
        <Button onClick={_onSaveStateClick} disabled={viewsState.length === 0}>Save State</Button>
        <Button onClick={_openDialog} disabled={viewsState.length === 0}>Edit Json</Button>
      </div>
      <div className="load-error">
        {showError(loadStateError)}
      </div>
      <Alert type="informational" className="instructions">
        Choose a view from the list to "Load" it into the viewport. Or manipulate the view and select "Save" to serialize it.
      </Alert>
    </div>
  );
};

export class SerializeViewWidgetProvider implements UiItemsProvider {
  public readonly id: string = "SerializeViewWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Bottom) {
      widgets.push(
        {
          id: "SerializeViewWidget",
          label: "Serialize View Selector",
          defaultState: WidgetState.Open,
          getWidgetContent: () => <SerializeViewWidget />,
        }
      );
    }
    return widgets;
  }
}
