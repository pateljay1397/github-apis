/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { useActiveIModelConnection, useActiveViewport } from "@itwin/appui-react";
import { IModelConnection } from "@itwin/core-frontend";
import { Badge, NodeData, NodeRenderProps, ProgressRadial, Tree, TreeNode } from "@itwin/itwinui-react";
import React, { ReactElement, ReactNode, useEffect, useState } from "react";
import { EmphasizeElementsApi } from "../apis/EmphasizeElementsApi";
import { useSelectionScopeContext } from "../ContextProvider";
import { convertElementIdToElementDetails, convertKeySetToElementDetails } from "../apis/HelperFunctions";
import { ElementDetails, TreeElement } from "../Interfaces";
import { HiliteElementsApi } from "../apis/HiliteElementsApi";
import { Presentation } from "@itwin/presentation-frontend";

interface ParentTreeInterface {
  selectedElement: ElementDetails | undefined;
  updatedSelectedElementDetails: (elementDetails: ElementDetails) => void;
  hiliteElementsApi: HiliteElementsApi | undefined;
}

/**
 * Recursively builds a list of ancestor elements by calculating the ancestor for the first element in the ElementDetails list.
 * If the first element is not the same as the calculated ancestor, the ancestor is added to the front of the list and the process
 * is repeated.
 * @param iModel The iModel in the Viewer.
 * @param list The list of ancestors being constructed.
 * @returns The list of ancestors being constructed.
 */
const generateListOfParents = async (iModel: IModelConnection, list: ElementDetails[]) => {
  const keySet = await Presentation.selection.scopes.computeSelection(iModel, list[0].id, "assembly");
  const parent = await convertKeySetToElementDetails(iModel, keySet);
  if (parent.id === list[0].id) {
    return list;
  } else {
    list.unshift(parent);
    const updatedList: ElementDetails[] = await generateListOfParents(iModel, list);
    return updatedList;
  }
};

/**
 * This function kicks off a recursive process for calculating the ancestors for the chosenElementId.
 * The ancestor list is ordered oldest -> youngest. Thus, the first element in the list is the oldest
 * ancestor and is the root of the tree.
 * @param iModel The iModel in the Viewer.
 * @param chosenElementId This is the element id for the element picked in the Element Picker drop down.
 * @returns The list of ancestors for the chosenElementId.
 */
const getTreeRoot = async (iModel: IModelConnection, chosenElementId: string) => {
  const baseList: ElementDetails[] = [];
  const currentElement: ElementDetails = await convertElementIdToElementDetails(iModel, chosenElementId);
  baseList.unshift(currentElement);
  const parentList = await generateListOfParents(iModel, baseList);
  return parentList;
};

// Recursively generate the nodes for the tree.
const generateItem = (treeHierarchy: ElementDetails[], index: number): TreeElement => {
  return {
    id: treeHierarchy[index].id,
    name: treeHierarchy[index].name ? treeHierarchy[index].name : "",
    className: treeHierarchy[index].className,
    children: index < treeHierarchy.length - 1 ? [generateItem(treeHierarchy, index+1)] : [],
  };
};

const getData = (treeHierarchy: ElementDetails[]): TreeElement[] => {
  if (treeHierarchy.length === 0) {
    return [];
  }
  return [generateItem(treeHierarchy, 0)];
};

export const ParentTree = ({ selectedElement, updatedSelectedElementDetails, hiliteElementsApi }: ParentTreeInterface) => {
  const { chosenElementId, activeScope, setActiveScope, validScopes } = useSelectionScopeContext();
  const iModelConnection = useActiveIModelConnection();
  const viewport = useActiveViewport();
  const [treeHierarchy, setTreeHierarchy] = useState<ElementDetails[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [assemblyElement, setAssemblyElement] = useState<ElementDetails>();
  const [topAssemblyElement, setTopAssemblyElement] = useState<ElementDetails>();
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize data
  useEffect(() => {
    const generateBaseData = async () => {
      setLoading(true);
      if (iModelConnection && chosenElementId) {
        setTreeHierarchy(await getTreeRoot(iModelConnection, chosenElementId));
        setAssemblyElement(
          await convertKeySetToElementDetails(
            iModelConnection,
            await Presentation.selection.scopes.computeSelection(iModelConnection, chosenElementId, "assembly")
          )
        );
        setTopAssemblyElement(
          await convertKeySetToElementDetails(
            iModelConnection,
            await Presentation.selection.scopes.computeSelection(iModelConnection, chosenElementId, "top-assembly")
          )
        );
      }
      setLoading(false);
    };
    void generateBaseData();
  }, [iModelConnection, chosenElementId]);

  // Start with all nodes in tree expanded
  useEffect(() => {
    if (treeHierarchy.length > 0) {
      treeHierarchy.forEach((node) => {
        setExpandedNodes((oldExpanded) => ({ ...oldExpanded, [node.id]: true }));
      });
    }
  }, [treeHierarchy]);

  // Handle expanding/minimizing tree nodes
  const onNodeExpanded = (nodeId: string, isExpanded: boolean) => {
    if (isExpanded) {
      setExpandedNodes((oldExpanded) => ({ ...oldExpanded, [nodeId]: true }));
    } else {
      setExpandedNodes((oldExpanded) => ({
        ...oldExpanded,
        [nodeId]: false,
      }));
    }
  };

  // Add labels to the nodes in the tree that would have been selected if the same chosenElementId was used, but with an alternate scope.
  const generateSublabelBadges = (treeElement: TreeElement): ReactNode => {
    const badges: ReactElement[] = [];
    if (chosenElementId && assemblyElement && topAssemblyElement) {
      if (treeElement.id === chosenElementId) {
        badges.push(
          <Badge key={"element"} backgroundColor={"skyblue"}>
            Element
          </Badge>
        );
      }
      if (treeElement.id === assemblyElement.id) {
        badges.push(
          <Badge key={"assembly"} backgroundColor={"orange"}>
            Assembly
          </Badge>
        );
      }
      if (treeElement.id === topAssemblyElement.id) {
        badges.push(
          <Badge key={"top"} backgroundColor={"gold"}>
            Top
          </Badge>
        );
      }
    }
    return (
      <div>
        {badges}
      </div>
    );
  };

  const _onSelectedChange = async (nodeId: string) => {
    // Base Case: Only do something iff all of the below are defined
    if (!iModelConnection || !viewport || !hiliteElementsApi || !chosenElementId) {
      return;
    }
    // Is the element id selectable from a scope change?
    const selectableFromScopeChange = nodeId === chosenElementId || nodeId === assemblyElement?.id || nodeId === topAssemblyElement?.id;
    // Is the element id selectable from more than one scope?
    const selectableFromMultipleScopes = (nodeId === chosenElementId && nodeId === assemblyElement?.id) ||
                                         (nodeId === chosenElementId && nodeId === topAssemblyElement?.id) ||
                                         (nodeId === assemblyElement?.id && nodeId === topAssemblyElement?.id);
    let ignoreScopeChange = false;
    // If the selected element is selectable from multiple scopes and the active scope already selects this element, do not change the scope
    if (selectableFromMultipleScopes) {
      const multipleScopesThatSelectThisElement: string[] = [];
      if (nodeId === chosenElementId) {
        multipleScopesThatSelectThisElement.push("element");
      }
      if (nodeId === assemblyElement?.id) {
        multipleScopesThatSelectThisElement.push("assembly");
      }
      if (nodeId === topAssemblyElement?.id) {
        multipleScopesThatSelectThisElement.push("top-assembly");
      }
      if (multipleScopesThatSelectThisElement.includes(activeScope?.id ? activeScope?.id : "")) {
        ignoreScopeChange = true;
      }
    }
    // If the element is selectable from changing the scope, do that
    if (selectableFromScopeChange && !ignoreScopeChange) {
      let newScope = validScopes.find((scope) => scope.id === "element");
      if (assemblyElement && assemblyElement.id !== chosenElementId && nodeId === assemblyElement.id) {
        newScope = validScopes.find((scope) => scope.id === "assembly");
      } else if (topAssemblyElement && topAssemblyElement.id !== chosenElementId && nodeId === topAssemblyElement.id) {
        newScope = validScopes.find((scope) => scope.id === "top-assembly");
      }
      if (newScope) {
        setActiveScope(newScope);
        await EmphasizeElementsApi.recalculateEmphasis(iModelConnection, viewport, chosenElementId, newScope);
      }
    } else if (!ignoreScopeChange) {
      // If the element is not selectable by changing the scope, use the elements details directly to calculate selection/hilites.
      const newElement = treeHierarchy.find((element) => element.id === nodeId);
      const elementScope = validScopes.find((scope) => scope.id === "element");
      if (newElement && elementScope) {
        setActiveScope(undefined);
        updatedSelectedElementDetails(newElement);
        await EmphasizeElementsApi.recalculateEmphasis(iModelConnection, viewport, newElement.id, elementScope);
      }
    }
  };

  const getNode = (node: TreeElement): NodeData<TreeElement> => {
    return {
      subNodes: node.children,
      nodeId: node.id,
      node,
      isExpanded: expandedNodes[node.id],
      hasSubNodes: node.children.length > 0,
    };
  };

  const nodeRenderer = (nodeRenderProps: NodeRenderProps<TreeElement>) => {
    return (
      <TreeNode
        label={nodeRenderProps.node.name}
        sublabel={generateSublabelBadges(nodeRenderProps.node)}
        onExpanded={onNodeExpanded}
        isSelected={selectedElement && nodeRenderProps.node.id === selectedElement.id ? true : false}
        onSelected={async (nodeId: string) => {await _onSelectedChange(nodeId);}}
        {...nodeRenderProps}
      />
    );
  };

  return (
    <div className={loading ? "centered-loading-radial" : undefined}>
      {loading ? (
        <ProgressRadial indeterminate/>
      ) : (
        <Tree<TreeElement>
          data={getData(treeHierarchy)}
          getNode={getNode}
          nodeRenderer={nodeRenderer}
        />)}
    </div>
  );
};
