/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useCallback, useEffect, useMemo } from "react";
import { actions, ActionType, Column,MetaBase, TableState } from "react-table";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { useActiveIModelConnection } from "@itwin/appui-react";
import { Table } from "@itwin/itwinui-react";
import { TestItem } from  "@itwin/property-validation-client";
import ValidationApi from "./ValidationApi";

interface TableRow extends Record<string, string> {
  name: string;
}

const ValidationTestsWidget = () => {
  const iModelConnection = useActiveIModelConnection();
  const [isAutoSelect, setIsAutoSelect] = React.useState<boolean>();
  const [validationTests, setValidationTests] = React.useState<any>();

  useEffect(() => {
    /** Create a listener that responds to tests data retrieval */
    const removeListener = ValidationApi.onTestsDataChanged.addListener((value: any) => {
      setValidationTests(value);
    });

    if (iModelConnection) {
      setIsAutoSelect(true);
      ValidationApi.setValidationTests(iModelConnection.iTwinId!).catch((error) => {
        console.error(error);
      });
    }
    return () => {
      removeListener();
    };
  }, [iModelConnection]);

  const columnDefinition = useMemo((): Column<TableRow>[] => [
    {
      Header: "Table",
      columns: [
        {
          Header: "Name",
          accessor: "name",
        },
      ],
    },
  ], []);

  const data = useMemo(() => {
    const rows: TableRow[] = [];

    if (!validationTests)
      return rows;

    validationTests.forEach((rowData: TestItem) => {
      const row: TableRow = {
        id: rowData.id,
        name: rowData.displayName,
      };
      rows.push(row);
    });

    return rows;
  }, [validationTests]);

  const controlledState = useCallback(
    (state: TableState<TableRow>, meta: MetaBase<TableRow>) => {
      if (isAutoSelect && meta.instance.rows && meta.instance.rows.length) {
        const row = meta.instance.rows[0];
        state.selectedRowIds = {};
        state.selectedRowIds[row.id] = true;
      }
      return { ...state };
    }, [isAutoSelect]);

  const tableStateSingleSelectReducer = (newState: any, action: ActionType): any => {
    switch (action.type) {
      case actions.toggleRowSelected: {
        return { ...newState, selectedRowIds: { [action.id]: action.value } };
      }
      default:
        break;
    }
    return newState;
  };

  const onRowClick = useCallback((_: any, row: any) => {
    if (iModelConnection) {
      setIsAutoSelect(false);
      ValidationApi.onTestIdChanged.raiseEvent(iModelConnection.iTwinId!, row.original.id);
      row.toggleRowSelected(true);
    }
  }, [iModelConnection]);

  return (
    <Table<TableRow>
      data={data}
      columns={columnDefinition}
      isLoading={!validationTests}
      isSortable
      onRowClick={onRowClick}
      useControlledState={controlledState}
      stateReducer={tableStateSingleSelectReducer}
      emptyTableContent={"No tests"}
      density="extra-condensed"
      style={{ height: "100%" }} />
  );
};

export class ValidationTestsWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ValidationTestsWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Left && _section === StagePanelSection.Start) {
      widgets.push(
        {
          id: "ValidationTestsWidget",
          label: "Tests",
          defaultState: WidgetState.Open,
          getWidgetContent: () => <ValidationTestsWidget />,
        }
      );
    }
    return widgets;
  }
}
