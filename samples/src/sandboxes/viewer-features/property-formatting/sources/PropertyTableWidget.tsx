/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect, useState } from "react";
import { PropertyRecord } from "@itwin/appui-abstract";
import { useActiveIModelConnection } from "@itwin/appui-react";
import { SimpleTableDataProvider, Table, TableDataProvider } from "@itwin/components-react";
import { ToggleSwitch } from "@itwin/itwinui-react";
import { KeySet } from "@itwin/presentation-common";
import { useUnifiedSelectionContext } from "@itwin/presentation-components";
import { PropertyFormattingApi } from "./PropertyFormattingApi";

const fieldNames = ["pc_bis_Element_Model", "pc_bis_Element_CodeValue", "pc_bis_Element_UserLabel"];

export const PropertyTableWidget = () => {
  const [customized, setCustomized] = useState<boolean>(false);
  const [showAllProperties, setShowAllProperties] = useState<boolean>(false);
  const [selectionSize, setSelectionSize] = useState<number>(0);
  const [dataProvider, setDataProvider] = useState<TableDataProvider | undefined>();
  const iModelConnection = useActiveIModelConnection();
  const selectionContext = useUnifiedSelectionContext();

  useEffect(() => {
    if (!iModelConnection)
      return;

    const selection = new KeySet(selectionContext?.getSelection());
    setSelectionSize(selection.size);

    if (!customized) {
      const provider = PropertyFormattingApi.createTableDataProvider(selection, iModelConnection);
      provider.keys = selection;
      setDataProvider(provider);
      return;
    }

    PropertyFormattingApi.createOverlySimplePropertyRecords(selection, iModelConnection, !showAllProperties ? fieldNames : [])
      .then((records) => {
        const columns = [{ key: "Name", label: "Property" }, { key: "Value", label: "Value" }];
        const customProvider = new SimpleTableDataProvider(columns);

        records.forEach((record, index) => {
          const cells = [
            { key: "Name", record: PropertyRecord.fromString(record.displayLabel) },
            { key: "Value", record: PropertyRecord.fromString(record.displayValue) },
          ];
          customProvider.addRow({ key: `record-${index}`, cells });
        });

        setDataProvider(customProvider);
      })
      .catch((error) => console.error(error));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionContext?.getSelection, iModelConnection, customized, showAllProperties]);

  return (
    <div className="sample-options">
      <div className="sample-table-grid">
        <ToggleSwitch
          label="Use customized table content"
          checked={customized}
          onChange={() => setCustomized(!customized)}
          disabled={!dataProvider} />
        {customized && <ToggleSwitch
          label="Show all properties"
          checked={showAllProperties}
          onChange={() => setShowAllProperties(!showAllProperties)}
          disabled={!dataProvider} />}
        {dataProvider && selectionSize > 0
          ? <Table dataProvider={dataProvider} className="sample-table-grid-a" />
          : <div className="sample-table-grid-b">Select an element(s) to see its properties.</div>}
      </div>
    </div>
  );
};
