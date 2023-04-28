/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useCallback, useEffect, useMemo } from "react";
import { Row } from "react-table";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { Alert, Code, LabeledSelect, Leading, Table, ToggleSwitch } from "@itwin/itwinui-react";
import { ReportingApi } from "./ReportingApi";
import { Group } from "./ReportingClient";
import "./Reporting.scss";

export const ReportingWidget: React.FunctionComponent = () => {
  const [applyZoom, setApplyZoom] = React.useState<boolean>(true);

  const getGroupOptions = () => {
    return ReportingApi.groups.map((group, index) => ({
      value: index,
      label: group.name ?? "Error",
    }));
  };

  const [groupsOptions, setGroupOptions] = React.useState(getGroupOptions());
  const [selectGroup, setSelectGroup] = React.useState<Group>(
    ReportingApi.selectGroup
  );

  useEffect(() => {
    const removeListener = ReportingApi.onReportingDataChanged.addListener(
      () => {
        setSelectGroup(ReportingApi.selectGroup);
        setGroupOptions(getGroupOptions());
      }
    );
    return () => {
      removeListener();
    };
  }, []);

  useEffect(() => {
    if (selectGroup) {
      ReportingApi.selectGroup = selectGroup;
      ReportingApi.onReportingDataChanged.raiseEvent();
    }
  }, [selectGroup]);

  useEffect(() => {
    if (applyZoom) {
      ReportingApi.enableZoom();
    } else {
      ReportingApi.disableZoom();
    }
  }, [applyZoom]);

  const getColumns = useMemo(
    () => [
      {
        Header: "Table",
        columns: [
          {
            id: "ECInstanceId",
            Header: "ECInstanceId",
            accessor: "ECInstanceId",
            width: 150,
          },
          {
            id: "ECClassId",
            Header: "ECClassId",
            accessor: "ECClassId",
          },
          {
            id: "UserLabel",
            Header: "UserLabel",
            accessor: "UserLabel",
          },
        ],
      },
    ],
    []
  );

  const data = useMemo(() => {
    const rows: Record<string, unknown>[] = [];
    if (selectGroup?.properties) {
      for (const prop of selectGroup.properties) {
        const row: Record<string, unknown> = {};
        ["ECInstanceId", "ECClassId", "UserLabel"].forEach(
          (p) => (row[p] = prop[p])
        );
        rows.push(row);
      }
    }
    return rows;
  }, [selectGroup]);

  const getExtraProps = useCallback(
    (id: string) => {
      if (selectGroup?.properties) {
        return selectGroup.properties.find((x) => x.ECInstanceId === id);
      }
    },
    [selectGroup]
  );

  const expandedSubComponent = useCallback(
    (row: Row) => {
      return selectGroup?.properties ? (
        <div style={{ padding: 16 }}>
          <Leading>Full property list</Leading>
          <pre>
            <code>
              {JSON.stringify(getExtraProps(row.values.ECInstanceId), null, 2)}
            </code>
          </pre>
        </div>
      ) : (
        false
      );
    },
    [selectGroup, getExtraProps]
  );

  return (
    <div className={"sample-options"}>
      <div className="sample-grid">
        <div className="selection-container">
          <LabeledSelect
            label="Select Group"
            displayStyle="inline"
            options={groupsOptions}
            value={ReportingApi.groups.indexOf(selectGroup)}
            onChange={(value) => {
              setSelectGroup(ReportingApi.groups[value]);
            }}
            onShow={undefined}
            onHide={undefined}
          />
          <ToggleSwitch
            label="Zoom to Selection"
            labelPosition="left"
            defaultChecked
            onChange={() => setApplyZoom(!applyZoom)}
          />
        </div>
        <div className="report-datatable">
          <Table
            data={data}
            columns={getColumns}
            emptyTableContent="No data"
            isLoading={!selectGroup}
            isSortable
            isResizable
            isSelectable
            subComponent={expandedSubComponent}
            onSelect={(row, _) => {
              ReportingApi.visualizeElements(
                row?.map((r) => r.ECInstanceId as string) ?? []
              );
            }}
            density="extra-condensed"
            style={{ height: "100%" }}
          />
        </div>
        <Alert type="informational" className="instructions">
          Choose a group from <Code>Select Group</Code> dropdown. Click on any
          table row to highlight and zoom to the element in the viewer. Toggle{" "}
          <Code>Zoom to Selection</Code> to enable/disable zoom.
        </Alert>
      </div>
    </div>
  );
};

export class ReportingWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ReportingWidgetProvider";

  public provideWidgets(
    _stageId: string,
    _stageUsage: string,
    location: StagePanelLocation,
    _section?: StagePanelSection
  ): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Bottom) {
      widgets.push({
        id: "ReportingWidget",
        label: "Group Selection",
        defaultState: WidgetState.Open,
        isFloatingStateSupported: true,
        getWidgetContent: () => <ReportingWidget />,
      });
    }
    return widgets;
  }
}
