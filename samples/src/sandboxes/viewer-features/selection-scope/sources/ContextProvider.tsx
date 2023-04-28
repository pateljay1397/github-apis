/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SelectionScope } from "@itwin/presentation-common";
import React, { createContext, Dispatch, SetStateAction, useContext, useState } from "react";

interface ContextInterface {
  activeScope: SelectionScope | undefined;
  setActiveScope: Dispatch<SetStateAction<SelectionScope | undefined>>;
  validScopes: SelectionScope[];
  setValidScopes: Dispatch<SetStateAction<SelectionScope[]>>;
  chosenElementId: string;
  setChosenElementId: Dispatch<SetStateAction<string>>;
}

const SelectionScopeContext = createContext<ContextInterface>({
  activeScope: undefined,
  setActiveScope: () => {},
  validScopes: [],
  setValidScopes: () => {},
  chosenElementId: "",
  setChosenElementId: () => {},
});

// Custom hook for using React context throughout project
export const useSelectionScopeContext = () => {
  return useContext(SelectionScopeContext);
};

export const ContextProvider: React.FC = ({ children }) => {
  // The scope that should be used for calculations
  const [activeScope, setActiveScope] = React.useState<SelectionScope | undefined>();
  // This is the list of scopes that is valid for the iModel
  const [validScopes, setValidScopes] = useState<SelectionScope[]>([]);
  // This is the element id for the element picked in the Element Picker drop down. It is used to calculate selections at different scopes.
  const [chosenElementId, setChosenElementId] = useState<string>("");
  const value: ContextInterface = {
    activeScope,
    setActiveScope,
    validScopes,
    setValidScopes,
    chosenElementId,
    setChosenElementId,
  };

  return (
    <SelectionScopeContext.Provider value={value}>
      {children}
    </SelectionScopeContext.Provider>
  );
};
