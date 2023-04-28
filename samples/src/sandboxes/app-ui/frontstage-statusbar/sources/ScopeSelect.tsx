/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect, useState } from "react";
import { useActiveViewport } from "@itwin/appui-react";
import { IModelConnection } from "@itwin/core-frontend";
import { Select } from "@itwin/itwinui-react";
import { Presentation } from "@itwin/presentation-frontend";
import { SelectionScope } from "@itwin/presentation-common";

/**
 * A React component allowing the active selection scope to be swapped.
 * More details about selection scope can be found in the sample titled "Selection Scope - Geometric Elements"
 */
export const ScopeSelect = () => {
  const viewport = useActiveViewport();
  const [scopes, setScopes] = useState<SelectionScope[]>([]);
  const [activeScope, setActiveScope] = useState<SelectionScope>();

  useEffect(() => {
    if (viewport) {
      void initializeScopeData(viewport.iModel);
    }
  }, [viewport]);

  const initializeScopeData = async (imodel: IModelConnection) => {
    const availableScopes = await Presentation.selection.scopes.getSelectionScopes(imodel);

    const currentActiveScope = availableScopes[0];
    Presentation.selection.scopes.activeScope = currentActiveScope;

    if (currentActiveScope) {
      setScopes(availableScopes);
      setActiveScope(currentActiveScope);
    }
  };

  const updateActiveScope = (scopeId: string) => {
    const newScope = scopes.find((scope) => scope.id === scopeId);
    if (newScope) {
      setActiveScope(newScope);
      Presentation.selection.scopes.activeScope = newScope;
    }
  };

  return (
    <Select options={scopes.map((scope)=>{return {value: scope.id, label: scope.label};})} value={activeScope ? activeScope.id : undefined} onChange={(value) => updateActiveScope(value)}/>
  );
};
