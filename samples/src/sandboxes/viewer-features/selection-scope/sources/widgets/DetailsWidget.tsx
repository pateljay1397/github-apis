/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useCallback, useEffect, useState} from "react";
import { useSelectionScopeContext } from "../ContextProvider";
import { Leading, Table } from "@itwin/itwinui-react";
import { WidgetState } from "@itwin/appui-abstract";
import { HilitedElements } from "../components/HilitedElements";
import { ParentTree } from "../components/ParentTree";
import { ElementDetails, elementDetailsColumns } from "../Interfaces";
import { useActiveIModelConnection } from "@itwin/appui-react";
import useHiliteElementsApi from "../apis/useHiliteElementsApi";
import { HelpIcon } from "../components/HelpIcon";
import "../SelectionScope.scss";
import { Presentation } from "@itwin/presentation-frontend";
import { convertKeySetToElementDetails, useWidgetDef } from "../apis/HelperFunctions";

/**
 * This widget displays details about the selected element
 */
export const DetailsWidget = () => {
  const { chosenElementId, activeScope } = useSelectionScopeContext();
  const iModelConnection = useActiveIModelConnection();
  // Get the widget definition by the id specified in SelectionScopeWidgetProvider.tsx
  const widgetDef = useWidgetDef("DetailsWidget");
  const hiliteElementsApi = useHiliteElementsApi();
  // This is the element that would have been selected based on our calculations with scope/element id
  // It is useful to know this element's details for displaying information in the Parent Tree and Hilited elements sections
  const [selectedElementDetails, setSelectedElementDetails] = useState<ElementDetails>();
  const [selectedElementLoading, setSelectedElementLoading] = useState<boolean>(false);

  // This useEffect controls whether the widget is visible or hidden.
  useEffect(() => {
    if (chosenElementId) {
      setTimeout(() => widgetDef?.setWidgetState(WidgetState.Open));
    } else {
      setTimeout(() => widgetDef?.setWidgetState(WidgetState.Hidden));
    }
  }, [chosenElementId, widgetDef]);

  // This useEffects calculates what element would have been selected whenever the scope or base element id changes
  useEffect(() => {
    const getDetails = async () => {
      setSelectedElementLoading(true);
      if (iModelConnection && chosenElementId && activeScope) {
        setSelectedElementDetails(
          await convertKeySetToElementDetails(
            iModelConnection,
            await Presentation.selection.scopes.computeSelection(iModelConnection, chosenElementId, activeScope.id)
          )
        );
      }
      setSelectedElementLoading(false);
    };
    void getDetails();
  }, [iModelConnection, chosenElementId, activeScope]);

  const updatedSelectedElementDetails = useCallback((elementDetails: ElementDetails) => {
    setSelectedElementDetails(elementDetails);
  }, [setSelectedElementDetails]);

  return (
    <div>
      <Leading className="leading-with-help-icon">
        Selected Element
        <HelpIcon message={"This is the details for the element you selected. It is provided in case you want to make any queries with the iModelConsole."}/>
      </Leading>
      <Table
        className="table"
        density="extra-condensed"
        data={selectedElementDetails ? [selectedElementDetails] : []}
        columns={elementDetailsColumns}
        emptyTableContent="No element selected"
        isSortable
        isLoading={selectedElementLoading}
      />
      <Leading className="leading-with-help-icon">
        Parent Tree
        <HelpIcon message={"This tree shows any parents of the selected element as well as what would have been selected if you had used a different scope. Click on any element in the tree to change your selection."}/>
      </Leading>
      <ParentTree selectedElement={selectedElementDetails} updatedSelectedElementDetails={updatedSelectedElementDetails} hiliteElementsApi={hiliteElementsApi} />
      <Leading className="leading-with-help-icon">
        Hilited Elements
        <HelpIcon message={"The element you selected and the elements that get hilited in the iModel viewport are not always the same thing. The set of elements that are reported as hilited are usually the element you selected and all its children elements."}/>
      </Leading>
      <HilitedElements selectedElement={selectedElementDetails} hiliteElementsApi={hiliteElementsApi} />
    </div>
  );
};

