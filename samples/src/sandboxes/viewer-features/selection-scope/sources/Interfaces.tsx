/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { InstanceKey } from "@itwin/presentation-common";
import { Column } from "react-table";

export interface ElementDetails extends Record<string, string | undefined>, InstanceKey {
  name: string | undefined;
}

/**
 * The elements in the parent tree
 */
export interface TreeElement extends InstanceKey {
  name: string | undefined;
  children: TreeElement[];
}

/**
 * The format for columns that display element details in a table
 */
export const elementDetailsColumns: Column<ElementDetails>[] = [
  {
    Header: "Table",
    columns: [
      { Header: "Element Id", accessor: "id", minWidth: 100 },
      { Header: "Name", accessor: "name", minWidth: 100 },
      { Header: "Class", accessor: "className", minWidth: 100 },
    ],
  },
];
