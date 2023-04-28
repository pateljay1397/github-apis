/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { useActiveIModelConnection } from "@itwin/appui-react";
import { Button, ExpandableBlock, Input, Table } from "@itwin/itwinui-react";
import React, { useEffect, useState } from "react";
import { HiliteElementsApi } from "../apis/HiliteElementsApi";
import { useSelectionScopeContext } from "../ContextProvider";
import { ElementDetails, elementDetailsColumns } from "../Interfaces";
import "../SelectionScope.scss";

interface HilitedElementsInterface {
  selectedElement: ElementDetails | undefined;
  hiliteElementsApi: HiliteElementsApi | undefined;
}

export const HilitedElements = ({ selectedElement, hiliteElementsApi }: HilitedElementsInterface) => {
  const { chosenElementId } = useSelectionScopeContext();
  const iModelConnection = useActiveIModelConnection();
  const [currentHilitedElements, setCurrentHilitedElements] = useState<ElementDetails[]>([]);
  const [filteredHilitedElements, setFilteredHilitedElements] = useState<ElementDetails[]>([]);
  const [hiliteSetLoading, setHiliteSetLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>("");

  // Calculate what elements should be hilited based on the currently selected element
  useEffect(() => {
    let active = true;
    const getCurrentHilitedElements = async () => {
      if (iModelConnection && hiliteElementsApi && selectedElement) {
        setHiliteSetLoading(true);
        setCurrentHilitedElements([]);
        const hiliteSetResults = await hiliteElementsApi.getHiliteSetAsElementDetails(iModelConnection, selectedElement.id);
        if (active) {
          setCurrentHilitedElements(hiliteSetResults);
          setHiliteSetLoading(false);
        }
      }
    };
    void getCurrentHilitedElements();
    return(() => {
      // This prevents stale results from appearing in the hilited elements table if multiple requests are made quickly.
      active = false;
    });
  }, [selectedElement, iModelConnection, hiliteElementsApi]);

  /**
   * Apply the filter to the elements listed in the table.
   * NOTE: Filtering is done outside of the Table here so we have access to the count of filtered elements.
   * For global filtering where the count is not needed, please use the globalFilterValue prop of the
   * Table.
   */
  useEffect(() => {
    const regEx = new RegExp(filter, "i");
    const filteredElements = currentHilitedElements.filter((element: ElementDetails) => {
      return regEx.test(element.className) || regEx.test(element.id) || (element.name && regEx.test(element.name));
    });
    setFilteredHilitedElements(filteredElements);
  }, [currentHilitedElements, filter]);

  // Only automatically clear the filter if the Details widget is closed.
  useEffect(() => {
    return(() => {
      if (!chosenElementId) {
        setFilter("");
      }
    });
  }, [chosenElementId]);

  return (
    <ExpandableBlock title={`Hilited Elements - ${hiliteSetLoading? "Loading..." : `(${filteredHilitedElements.length}/${currentHilitedElements.length})`}`}>
      <div className="table-with-search-bar">
        <div className="input-with-button">
          <Input
            size="small"
            placeholder="Search..."
            onChange={(event)=>setFilter(event.target.value)}
            value={filter}
          />
          <Button
            size="small"
            onClick={() => {
              setFilter("");
            }}
          >
          Clear
          </Button>
        </div>
        <Table
          className="table"
          density="extra-condensed"
          data={filteredHilitedElements}
          columns={elementDetailsColumns}
          emptyTableContent="No elements match filter"
          isSortable
          isLoading={hiliteSetLoading}
        />
      </div>
    </ExpandableBlock>
  );
};
