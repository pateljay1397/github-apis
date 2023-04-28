/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { actions, MetaBase, TableState } from "react-table";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { Table } from "@itwin/itwinui-react";
import { RunDetails } from  "@itwin/property-validation-client";
import ValidationApi from "./ValidationApi";

interface TableRow extends Record<string, string> {
  time: string;
  count: string;
}

const ValidationRunsWidget = () => {
  const [isAutoSelect, setIsAutoSelect] = useState<boolean>();
  const [validationRuns, setValidationRuns] = useState<RunDetails[] | undefined>();

  useEffect(() => {
    const removeListener = ValidationApi.onTestIdChanged.addListener((projectId: string, testId: string) => {
      setValidationRuns(undefined);
      ValidationApi.setValidationRuns(projectId, testId)
        .catch((error) => {
          console.error(error);
        });
    });

    return () => {
      removeListener();
    };
  }, []);

  useEffect(() => {
    const removeListener = ValidationApi.onRunsDataChanged.addListener((value: any) => {
      setValidationRuns(value ?? []);
      setIsAutoSelect(true);
    });

    return () => {
      removeListener();
    };
  }, []);

  const columnDefinition = useMemo(() => [
    {
      Header: "Table",
      columns: [
        {
          Header: "Time",
          accessor: "time",
        },
        {
          Header: "Count",
          accessor: "count",
        },
      ],
    },
  ], []);

  const data = useMemo(() => {
    const rows: TableRow[] = [];

    if (!validationRuns)
      return rows;

    validationRuns.forEach((rowData: RunDetails) => {
      const time = new Date(rowData.executedDateTime).toLocaleString();
      const row: TableRow = {
        id: rowData.id,
        resultId: rowData.resultId,
        time,
        count: rowData.count,
      };
      rows.push(row);
    });

    return rows;
  }, [validationRuns]);

  const controlledState = useCallback(
    (state: TableState<TableRow>, meta: MetaBase<TableRow>) => {
      if (isAutoSelect) {
        state.selectedRowIds = {};
        if (meta.instance.rows && meta.instance.rows.length) {
          const row = meta.instance.rows[0];
          state.selectedRowIds[row.id] = true;
        }
      }
      return { ...state };
    },
    [isAutoSelect]
  );

  const onRowClick = useCallback((_, row) => {
    setIsAutoSelect(false);
    ValidationApi.onRunIdChanged.raiseEvent(row.original.resultId);
    row.toggleRowSelected(true);
  }, [setIsAutoSelect]);

  const tableStateSingleSelectReducer = (newState: any, action: any): any => {
    switch (action.type) {
      case actions.toggleRowSelected: {
        return { ...newState, selectedRowIds: { [action.id]: action.value } };
      }
      default:
        break;
    }
    return newState;
  };

  return (
    <Table<TableRow>
      data={data}
      columns={columnDefinition}
      onRowClick={onRowClick}
      isSortable
      isLoading={!validationRuns}
      useControlledState={controlledState}
      stateReducer={tableStateSingleSelectReducer}
      style={{ height: "100%" }}
      emptyTableContent="No results"
      density="extra-condensed" />
  );
};

export class ValidationRunsWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ValidationRunsWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Left && _section === StagePanelSection.End) {
      widgets.push(
        {
          id: "ValidationRunsWidget",
          label: "Runs",
          defaultState: WidgetState.Open,
          getWidgetContent: () => <ValidationRunsWidget />,
        }
      );
    }
    return widgets;
  }
}
