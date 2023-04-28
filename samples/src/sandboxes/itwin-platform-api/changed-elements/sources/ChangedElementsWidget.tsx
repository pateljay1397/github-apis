/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { useActiveIModelConnection } from "@itwin/appui-react";
import { assert } from "@itwin/core-bentley";
import { IModelApp } from "@itwin/core-frontend";
import { MinimalNamedVersion } from "@itwin/imodels-client-management";
import { Alert, InputGroup, Label, LabeledSelect, ProgressLinear, Text, ToggleSwitch } from "@itwin/itwinui-react";
import { ChangedElementsApi } from "./ChangedElementsApi";
import "./ChangedElements.scss";

export const ChangedElementsWidget = () => {
  // State Declarations
  const iModelConnection = useActiveIModelConnection();
  const [isRequest, setIsRequest] = React.useState<boolean>(false);
  const [showInserts, setShowInsert] = React.useState<boolean>(true);
  const [showUpdates, setShowUpdate] = React.useState<boolean>(true);
  const [showUnchanged, setShowUnchanged] = React.useState<boolean>(true);
  const [showMap, setShowMap] = React.useState<boolean>(false);
  const initialIndex = ChangedElementsApi.namedVersions.length >= 4 ? 3 : 0;
  const [selectVersion, setVersion] = React.useState<MinimalNamedVersion>(ChangedElementsApi.namedVersions[initialIndex]);

  // initialize view with comparison of current and next Named Version
  React.useEffect(() => {
    assert(iModelConnection?.changeset.id !== undefined);
    assert(selectVersion.changesetId !== undefined && selectVersion.changesetId !== null);
    setIsRequest(true);
    ChangedElementsApi.compareChangesets(selectVersion.changesetId, iModelConnection.changeset.id)
      .finally(() => setIsRequest(false));
  }, [selectVersion, iModelConnection]);

  // Update visualization options
  React.useEffect(() => {
    ChangedElementsApi.changeOptions({
      showInserts,
      showUpdates,
      showUnchanged,
    });
  }, [showInserts, showUpdates, showUnchanged]);

  // Turn on/off background map
  React.useEffect(() => {
    const vp = IModelApp.viewManager.selectedView;
    if (vp === undefined) {
      return;
    }

    vp.view.viewFlags = vp.viewFlags.with("backgroundMap", showMap);
  }, [showMap]);

  const namedVersionsOptions = ChangedElementsApi.namedVersions
    .map((version, index) => ({ value: index, label: `${version.displayName}` }));

  const currentVersionName = ChangedElementsApi.namedVersions
    .find((version) => version.changesetId === iModelConnection?.changeset.id)?.displayName
    ?? "Error: No Named Version found for active changeset";

  return (
    <div className="sample-options">
      {isRequest
        ? <ProgressLinear labels={["Requesting changes..."]} indeterminate className="loading-state" />
        : <>
          <div className="sample-grid">
            <InputGroup displayStyle="inline">
              <Label htmlFor="current-version">Comparing against:</Label>
              <Text id="current-version">{currentVersionName}</Text>
            </InputGroup>
            <LabeledSelect
              label="Select version:"
              displayStyle="inline"
              size="small"
              options={namedVersionsOptions}
              value={ChangedElementsApi.namedVersions.indexOf(selectVersion)}
              disabled={isRequest}
              onChange={(value) => setVersion(ChangedElementsApi.namedVersions[value])}
            />
          </div>
          <div className="sample-grid">
            <Label>Visualize Changes:</Label>
            <ToggleSwitch onChange={() => {setShowInsert(!showInserts);}} defaultChecked={showInserts} label="Show Inserts" />
            <ToggleSwitch onChange={() => {setShowUpdate(!showUpdates);}} defaultChecked={showUpdates} label="Show Updates" />
            <ToggleSwitch onChange={() => {setShowUnchanged(!showUnchanged);}} defaultChecked={showUnchanged} label="Show Unchanged" />
          </div>
          <ToggleSwitch onChange={() => {setShowMap(!showMap);}} defaultChecked={showMap} label="Show Background Map" />
          <Alert type="informational" className="instructions">
            Use the drop down to select the named version to compare against. Observe the changed elements are emphasized with color. Unchanged elements are faded grey. Use the toggles to change the display of changed elements.
          </Alert >
        </>}
    </div>
  );
};

export class ChangedElementsWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ChangedElementsWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Bottom && _section === StagePanelSection.Start) {
      widgets.push(
        {
          id: "ChangedElementsWidget",
          label: "Changed Elements Controls",
          defaultState: WidgetState.Open,
          getWidgetContent: () => <ChangedElementsWidget />,
        }
      );
    }
    return widgets;
  }
}
