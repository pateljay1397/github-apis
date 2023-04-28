/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { actions, ActionType, Column, MetaBase, TableInstance, TableState } from "react-table";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { Table } from "@itwin/itwinui-react";
import ValidationApi from "./ValidationApi";

interface TableRow extends Record<string, string> {
  elementId: string;
  elementLabel: string;
  ruleName: string;
  legalValues: string;
  value: string;
}

const ValidationResultsWidget = () => {
  const [isAutoSelect, setIsAutoSelect] = useState<boolean>();
  const [validationResults, setValidationResults] = useState<any>();
  const [ruleData, setRuleData] = useState<any>();
  const [selectedElement, setSelectedElement] = useState<string | undefined>();

  useEffect(() => {
    const removeListener = ValidationApi.onRunIdChanged.addListener((resultId: string | undefined) => {
      if (!resultId) {
        setValidationResults([]);
        setRuleData([]);
        setIsAutoSelect(false);
      } else {
        setValidationResults(undefined);
        setRuleData(undefined);
        ValidationApi.setValidationResults(resultId)
          .catch((error) => {
            console.error(error);
          });
      }
    });

    return () => {
      removeListener();
    };
  }, []);

  useEffect(() => {
    const removeDataListener = ValidationApi.onResultsDataChanged.addListener((value: any) => {
      setValidationResults(value ? value.resultsData : undefined);
      setRuleData(value ? value.resultRules : undefined);
      setIsAutoSelect(true);
      if (!value || value.resultsData.result.length === 0) {
        ValidationApi.resetDisplay();
      }
    });

    return () => {
      removeDataListener();
    };
  }, []);

  useEffect(() => {
    const removeElementListener = ValidationApi.onMarkerClicked.addListener((elementId) => {
      setIsAutoSelect(false);
      setSelectedElement(elementId);
    });

    return () => {
      removeElementListener();
    };
  }, []);

  const columnDefinition = useMemo((): Column<TableRow>[] => [
    {
      Header: "Table",
      columns: [
        {
          Header: "Element Id",
          accessor: "elementId",
        },
        {
          Header: "Element Label",
          accessor: "elementLabel",
        },
        {
          Header: "Rule Name",
          accessor: "ruleName",
        },
        {
          Header: "Legal Range",
          accessor: "legalValues",
        },
        {
          Header: "Invalid Value",
          accessor: "value",
        },
      ],
    },
  ], []);

  const data = useMemo(() => {
    const rows: TableRow[] = [];

    if (!validationResults || !validationResults.result || !validationResults.ruleList || !ruleData)
      return rows;

    const getLegalValue = (item: any) => {
      const ruleId = validationResults.ruleList[item.ruleIndex].id;
      const currentRuleData = ruleData.find((rule: any) => rule.id === ruleId);
      if (!currentRuleData)
        return "";

      if (currentRuleData.functionParameters.lowerBound) {
        if (currentRuleData.functionParameters.upperBound) {
          // Range of values
          return `[${currentRuleData.functionParameters.lowerBound},${currentRuleData.functionParameters.upperBound}]`;
        } else {
          // Value has a lower bound
          return `>${currentRuleData.functionParameters.lowerBound}`;
        }
      } else {
        // Value needs to be defined
        return "Must be Defined";
      }
    };

    validationResults.result.forEach((rowData: any) => {
      const row: TableRow = {
        elementId: rowData.elementId,
        elementLabel: rowData.elementLabel,
        ruleName: validationResults.ruleList[+rowData.ruleIndex].displayName,
        legalValues: getLegalValue(rowData),
        value: rowData.badValue,
      };
      rows.push(row);
    });

    return rows;
  }, [validationResults, ruleData]);

  const controlledState = useCallback(
    (state: TableState<TableRow>, meta: MetaBase<TableRow>) => {
      if (selectedElement) {
        state.selectedRowIds = {};
        const row = meta.instance.rows.find((item) => item.original.elementId === selectedElement);
        if (row) {
          state.selectedRowIds[row.id] = true;
        }
      } else if (isAutoSelect) {
        state.selectedRowIds = {};
        if (meta.instance.rows && meta.instance.rows.length) {
          const row = meta.instance.rows[0];
          state.selectedRowIds[row.id] = true;
          ValidationApi.visualizeViolation(row.original.elementId, false);
        }
      }
      return { ...state };
    },
    [isAutoSelect, selectedElement]
  );

  const onRowClick = useCallback((_, row) => {
    setIsAutoSelect(false);
    ValidationApi.visualizeViolation(row.original.elementId, false);
    setSelectedElement(row.original.elementId);
    row.toggleRowSelected(true);
  }, []);

  const tableStateReducer = (
    newState: TableState<TableRow>,
    action: ActionType,
    _previousState: TableState<TableRow>,
    instance?: TableInstance<TableRow> | undefined
  ): TableState<TableRow> => {
    switch (action.type) {
      case actions.toggleRowSelected: {
        newState.selectedRowIds = {};
        if (action.value)
          newState.selectedRowIds[action.id] = true;

        if (instance) {
          const elementId = instance.rowsById[action.id].original.elementId;
          setSelectedElement(elementId);
        }
        break;
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
      isLoading={!validationResults}
      useControlledState={controlledState}
      stateReducer={tableStateReducer}
      style={{ height: "100%" }}
      emptyTableContent="No results"
      density="extra-condensed" />
  );
};

export class ValidationResultsWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ValidationResultsWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Bottom && _section === StagePanelSection.Start) {
      widgets.push(
        {
          id: "ValidationResultsWidget",
          label: "Validation Results",
          defaultState: WidgetState.Open,
          getWidgetContent: () => <ValidationResultsWidget />,
        }
      );
    }
    return widgets;
  }
}
