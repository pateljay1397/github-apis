/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect, useMemo } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { useActiveIModelConnection } from "@itwin/appui-react";
import { Table } from "@itwin/itwinui-react";
import { RuleDetails } from  "@itwin/property-validation-client";
import ValidationApi from "./ValidationApi";

interface TableRow extends Record<string, string> {
  name: string;
  description: string;
}

const ValidationRulesWidget = () => {
  const iModelConnection = useActiveIModelConnection();
  const [validationRules, setValidationRules] = React.useState<any>();

  useEffect(() => {
    /** Create a listener that responds to rule retrieval */
    const removeListener = ValidationApi.onRulesDataChanged.addListener((value: any) => {
      setValidationRules(value);
    });

    if (iModelConnection) {
      ValidationApi.setValidationRules(iModelConnection.iTwinId!).catch((error) => {
        console.error(error);
      });
    }
    return () => {
      removeListener();
    };
  }, [iModelConnection]);

  const columnDefinition = useMemo(() => [
    {
      Header: "Table",
      columns: [
        {
          Header: "Name",
          accessor: "name",
        },
        {
          Header: "Description",
          accessor: "description",
        },
      ],
    },
  ], []);

  const data = useMemo(() => {
    const rows: TableRow[] = [];

    if (!validationRules)
      return rows;

    validationRules.forEach((rowData: RuleDetails) => {
      const row: TableRow = {
        name: rowData.displayName,
        description: rowData.description,
      };
      rows.push(row);
    });

    return rows;
  }, [validationRules]);

  return (
    <Table<TableRow>
      data={data}
      isSortable
      isLoading={!validationRules}
      columns={columnDefinition}
      style={{ height: "100%" }}
      emptyTableContent="No rules"
      density="extra-condensed" />
  );
};

export class ValidationRulesWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ValidationRulesWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Bottom && _section === StagePanelSection.Start) {
      widgets.push(
        {
          id: "ValidationRulesWidget",
          label: "Rules",
          defaultState: WidgetState.Open,
          getWidgetContent: () => <ValidationRulesWidget />,
        }
      );
    }
    return widgets;
  }
}
