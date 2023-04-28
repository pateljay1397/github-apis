/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useCallback, useEffect, useState } from "react";
import { useSelectionScopeContext } from "../ContextProvider";
import { useActiveIModelConnection, useActiveViewport } from "@itwin/appui-react";
import { Alert, Button, LabeledSelect, SelectOption } from "@itwin/itwinui-react";
import { IModelApp, IModelConnection } from "@itwin/core-frontend";
import { Presentation } from "@itwin/presentation-frontend";
import { EmphasizeElementsApi } from "../apis/EmphasizeElementsApi";
import { NoSelectionTool } from "../tools/NoSelectionTool";
import { SelectionScope } from "@itwin/presentation-common";
import useHiliteElementsApi from "../apis/useHiliteElementsApi";
import { HelpIcon } from "../components/HelpIcon";
import "../SelectionScope.scss";

// The list of interesting elements you can select from
const elementOptions: SelectOption<string>[] = [
  {
    label: "Pipe 8 A1-OPM 1-SWS-0204-EX-OPM [7-I]",
    value: "0x70000000012",
  },
  {
    label: "V-301 [4-R0]",
    value: "0x400000003cc",
  },
  {
    label: "Hand Wheel [4-BU]",
    value: "0x400000001aa",
  },
  {
    label: "HV-109 [4-6K]",
    value: "0x400000000ec",
  },
  {
    label: "50-FV-010 [4-76]",
    value: "0x40000000102",
  },
  {
    label: "PipeClevis [4-1KW]",
    value: "0x40000000800",
  },
  {
    label: "1-SWS-0107-EX-OPM [4-C0]",
    value: "0x4000000029a",
  },
  {
    label: "EX-201-N2 [4-MG]",
    value: "0x40000000328",
  },
];

/**
 * This widget controls what element is selected
 */
export const ElementPickerWidget = () => {
  const {
    activeScope,
    setActiveScope,
    chosenElementId,
    setChosenElementId,
    validScopes,
    setValidScopes } = useSelectionScopeContext();
  const iModelConnection = useActiveIModelConnection();
  const viewport = useActiveViewport();
  const hiliteElementsApi = useHiliteElementsApi();
  const [elementName, setElementName] = useState<string>("");

  /**
   * Sets the Presentation manager/viewer to use element scope. Also sets what scopes are valid for the iModel.
   */
  const initializeScopeData = useCallback(async (imodel: IModelConnection) => {
    const scopes = await Presentation.selection.scopes.getSelectionScopes(imodel);
    const elementScope = scopes.find((scope) => scope.id === "element");
    /**
     * We set the Presentation manager to element scope during initialization.
     * After this point, we never change the scope set in the Presentation Manager.
     * Instead, we track which scope is selected in the dropdown and calculate the
     * selection set and the hilite set manually based on that scope.
     * Technically, this sample never uses the selection scope set in the Presentation Manager.
     * Instead this line of code is kept for two reasons.
     *  1. To show how the Presentation Manager scope could be set. The selection scope of the Presentation Manager
     *     could also be set by using the UiFramework getActiveSelectionScope and/or setActiveSelectionScope functions.
     *  2. To distinguish that this sample does not make use of the Presentation Manager beyond this point.
     */
    Presentation.selection.scopes.activeScope = elementScope;

    if (elementScope) {
      setValidScopes(scopes);
      setActiveScope(elementScope);
    }
  }, [setActiveScope, setValidScopes]);

  /**
   * Initialize the NoSelectionTool on widget load
   */
  useEffect(() => {
    NoSelectionTool.register(NoSelectionTool.toolId);
    setTimeout(() => { void IModelApp.tools.run(NoSelectionTool.toolId); }, 10);

    return () => {
      IModelApp.tools.unRegister(NoSelectionTool.toolId);
    };
  }, []);

  /**
   * Initialize needed providers and selection scope state
   */
  useEffect(() => {
    if (viewport) {
      void initializeScopeData(viewport.iModel);
    }
  }, [viewport, initializeScopeData]);

  const _onScopeChange = useCallback(async (scopeId: string) => {
    const newScope = validScopes.find((scope) => scope.id === scopeId);
    if (newScope) {
      if (iModelConnection && viewport && hiliteElementsApi && chosenElementId) {
        await EmphasizeElementsApi.recalculateEmphasis(iModelConnection, viewport, chosenElementId, newScope);
        // Update scope
        setActiveScope(newScope);
      } else if (!chosenElementId) {
        // Change scope even if no element is selected
        setActiveScope(newScope);
      }
    }
  }, [iModelConnection, viewport, hiliteElementsApi, chosenElementId, validScopes, setActiveScope]);

  const _onElementChange = useCallback(async (elementId: string) => {
    let scope: SelectionScope | undefined = activeScope;
    // Resets the scope back to Element scope if switching elements and the current scope is undefined/not-applicable.
    if (scope === undefined) {
      scope = validScopes.find((validScope) => validScope.id === "element");
      setActiveScope(scope);
    }
    if (iModelConnection && viewport && hiliteElementsApi && scope) {
      await EmphasizeElementsApi.recalculateEmphasis(iModelConnection, viewport, elementId, scope);
      // Update element id
      setChosenElementId(elementId);
      elementOptions.forEach((option) => {
        if (option.value === elementId) {
          setElementName(option.label);
        }
      });
    }
  }, [iModelConnection, viewport, hiliteElementsApi, activeScope, setActiveScope, validScopes, setChosenElementId]);

  const _onCancel = useCallback(() => {
    if (viewport) {
      let scope: SelectionScope | undefined = activeScope;
      // Resets the scope back to Element scope if canceling selection and the current scope is undefined/not-applicable.
      if (scope === undefined) {
        scope = validScopes.find((validScope) => validScope.id === "element");
        setActiveScope(scope);
      }
      // Remove emphasis from old elements
      EmphasizeElementsApi.clearEmphasizedElements(viewport);
      // Reset element id
      setChosenElementId("");
    }
  }, [viewport, setChosenElementId, activeScope, setActiveScope, validScopes]);

  return (
    <div className="element-picker-container">
      <Alert className="alert" type="informational">
        Choose a selection scope. Then choose which element you want to select. Click cancel to clear your selection.
      </Alert>
      <LabeledSelect
        label={"Pick Scope:"}
        options={validScopes.map((scope)=>{return {value: scope.id, label: scope.label};})}
        value={activeScope ? activeScope.id : undefined}
        placeholder={
          <div>
            No applicable scope
            <HelpIcon opaque message={`The element you have selected would normally not be directly selectable from ${elementName}'s element id by using any selection scope.`} />
          </div>
        }
        onChange={_onScopeChange}
      />
      <div className="input-with-button">
        <LabeledSelect
          label={"Pick Element:"}
          options={elementOptions}
          value={chosenElementId}
          onChange={_onElementChange}
        />
        <Button onClick={_onCancel}>Cancel</Button>
      </div>
    </div>
  );
};
