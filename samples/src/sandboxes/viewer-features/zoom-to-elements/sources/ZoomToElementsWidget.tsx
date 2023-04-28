/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Column } from "react-table";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { useActiveIModelConnection } from "@itwin/appui-react";
import { StandardViewId } from "@itwin/core-frontend";
import { SvgAdd, SvgDelete } from "@itwin/itwinui-icons-react";
import { Alert, Button, Code, Fieldset, InputGroup, Radio, Table, ToggleSwitch } from "@itwin/itwinui-react";
import { KeySet } from "@itwin/presentation-common";
import { Presentation, SelectionChangeEventArgs } from "@itwin/presentation-frontend";
import { StandardViewPicker } from "./StandardViewPicker";
import { ZoomOptions, ZoomToElementsApi } from "./ZoomToElementsApi";
import "./ZoomToElements.scss";

interface SelectedElement extends Record<string, string> {
  elementId: string;
  className: string;
}

const columns: Column<SelectedElement>[] = [
  {
    Header: "Table",
    columns: [
      { Header: "Element Id", accessor: "elementId", maxWidth: 120 },
      { Header: "Class Name", accessor: "className" },
    ],
  },
];

const ZoomToElementsWidget = () => {
  const iModelConnection = useActiveIModelConnection();
  const [selectedTableRows, setSelectedTableRows] = useState<SelectedElement[]>([]);

  const [elementsAreSelected, setElementsAreSelected] = useState<boolean>(false);
  const [capturedElements, setCapturedElements] = useState<SelectedElement[]>([]);
  const [zoomOptions, setZoomOptions] = useState<ZoomOptions>({
    animateEnable: true,
    zoomView: "current",
    view: StandardViewId.Top,
  });

  const selectedElements = useRef<KeySet>(new KeySet());

  const _onSelectionChanged = (event: SelectionChangeEventArgs) => {
    selectedElements.current = new KeySet(event.keys);
    setElementsAreSelected(!event.keys.isEmpty);
  };

  useEffect(() => {
    // Subscribe for unified selection changes
    // Change the default selection scope. Top-assembly scope returns key of selected element's topmost parent element (or just the element if it has no parents)
    Presentation.selection.scopes.activeScope = "top-assembly";
    Presentation.selection.selectionChange.addListener(_onSelectionChanged);
  }, []);

  const captureSelection = () => {
    let elements: SelectedElement[] = [];

    selectedElements.current.instanceKeys.forEach((values, key) => {
      const classElements = Array.from(values)
        .filter((value) => capturedElements.find((e) => e.elementId === value) === undefined)
        .map((value) => ({ elementId: value, className: key }));
      elements = elements.concat(classElements);
    });

    setCapturedElements(capturedElements.concat(elements));
  };

  const removeTableRows = () => {
    const result = capturedElements.filter((element) => selectedTableRows.find((row) => row.elementId === element.elementId) === undefined);
    setCapturedElements(result);
    setSelectedTableRows([]);
    if (iModelConnection) {
      iModelConnection.selectionSet.emptyAll();
    }
  };

  const applyZoom = async () => {
    if (iModelConnection) {
      const ids = capturedElements.map((el) => el.elementId);
      await ZoomToElementsApi.zoomToElements(ids, zoomOptions);

      // Select the elements. This is not necessary, but it makes them easier to see.
      iModelConnection.selectionSet.replace(ids);
    }
  };

  const onSelect = useCallback((rows: SelectedElement[] | undefined) => {
    const _rows = rows || [];
    setSelectedTableRows(_rows);
    if (iModelConnection) {
      iModelConnection.selectionSet.replace(_rows.map((m) => m.elementId));
    }
  }, [iModelConnection]);

  const onZoomViewSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setZoomOptions({ ...zoomOptions, zoomView: event.target.value as any });
  };

  return (
    <div className="sample-options">
      <div className="sample-grid">
        <Fieldset legend="Selected elements" className="selection-control">
          <div className="selection-control-datatable">
            <Table
              density="extra-condensed"
              data={capturedElements}
              columns={columns}
              emptyTableContent="No elements selected"
              isSelectable={true}
              onSelect={onSelect}
              isSortable
              style={{ height: "100%" }}
            />
          </div>
          <InputGroup displayStyle="inline">
            <Button size="small" startIcon={<SvgAdd />} title="Add Elements selected in view" onClick={captureSelection} disabled={!elementsAreSelected}>
              Add
            </Button>
            <Button size="small" startIcon={<SvgDelete />} title="Remove selected list entries" onClick={removeTableRows} disabled={!selectedTableRows.length}>
              Remove
            </Button>
          </InputGroup>
        </Fieldset>
        <Fieldset className="zoom-controls" legend="Zoom Settings">
          <ToggleSwitch label="Animate" className="zoom-controls-a" checked={zoomOptions.animateEnable} onChange={() => setZoomOptions({ ...zoomOptions, animateEnable: !zoomOptions.animateEnable })} />
          <InputGroup className="zoom-controls-b">
            <Radio label="Maintain Current view" value="current" checked={zoomOptions.zoomView === "current"} onChange={onZoomViewSelect} />
            <Radio label="Change to Standard View" value="standard" checked={zoomOptions.zoomView === "standard"} onChange={onZoomViewSelect} />
            <Radio label="Change to Relative View" value="relative" checked={zoomOptions.zoomView === "relative"} onChange={onZoomViewSelect} />
          </InputGroup>
          <StandardViewPicker
            className="zoom-controls-c"
            selectedView={zoomOptions.view}
            onChange={(viewId: StandardViewId) => { setZoomOptions({ ...zoomOptions, view: viewId }); }}
            disabled={zoomOptions.zoomView === "current"} />
          <Button styleType="high-visibility" className="zoom-controls-d" onClick={applyZoom} disabled={!capturedElements.length}>Zoom to Elements</Button>
        </Fieldset>
        <Alert type="informational" className="instructions">
          Select one or more elements in the view. Click on <Code>Add</Code> button to capture their ids into a list. Set the options and then click <Code>Zoom to Elements</Code>
        </Alert>
      </div>
    </div>
  );
};

export class ZoomToElementsWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ZoomToElementsWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Bottom) {
      widgets.push(
        {
          id: "ZoomToElementsWidget",
          label: "Zoom to Elements Selector",
          defaultState: WidgetState.Open,
          getWidgetContent: () => <ZoomToElementsWidget />,
        }
      );
    }
    return widgets;
  }
}
