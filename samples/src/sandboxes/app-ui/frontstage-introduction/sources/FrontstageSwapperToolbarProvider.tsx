/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/import React from "react";
import { CommonToolbarItem, ToolbarOrientation, ToolbarUsage, UiItemsProvider } from "@itwin/appui-abstract";
import { CommandItemDef, FrontstageManager, GroupItemDef, ToolbarHelper } from "@itwin/appui-react";
import { SvgHelpCircular, SvgInfoCircular, SvgMenu, SvgTransparency, SvgVisibilityEmphasize } from "@itwin/itwinui-icons-react";

// List of frontstages to display in the dropdown
const frontstages = [
  {
    id: "sandbox:instructions-frontstage",
    labelKey: "Instructions",
    icon: <SvgHelpCircular />,
  },
  {
    id: "sandbox:default-frontstage",
    labelKey: "Default",
    icon: <SvgInfoCircular />,
  },
  {
    id: "sandbox:two-viewports-frontstage",
    labelKey: "Two Viewports",
    icon: <SvgVisibilityEmphasize />,
  },
  {
    id: "sandbox:view-attributes-frontstage",
    labelKey: "View Attributes",
    icon: <SvgTransparency />,
  },
];

/**
 * Creates a list of command items (one for each frontstage). Clicking on the command item causes the "execute" function to fire.
 * @returns List of CommandItemDefs
 */
const getFrontstageItems = (): CommandItemDef[] => {
  const defs: CommandItemDef[] = [];
  for (const frontstage of frontstages) {
    defs.push(
      new CommandItemDef({
        commandId: `OpenFronstage:${frontstage.id}`,
        labelKey: frontstage.labelKey,
        iconSpec: frontstage.icon,
        execute: async () => {
          await FrontstageManager.setActiveFrontstage(frontstage.id);
        },
      })
    );
  }
  return defs;
};

/**
 * Creates a group item containing the list of frontstage command items (serves as a dropdown from button click)
 * @returns A GroupItemDef
 */
const getListOfFrontstagesAsGroupItemDef = (): GroupItemDef => {
  const items = getFrontstageItems();
  return new GroupItemDef({
    groupId: "frontstage-list-group-item",
    labelKey: "Frontstages",
    panelLabelKey: "Frontstages",
    iconSpec: <SvgMenu />,
    items,
  });
};

export class FrontstageSwapperToolbarProvider implements UiItemsProvider  {
  public readonly id: string = "FrontstageSwapperToolbar";

  public provideToolbarButtonItems(_stageId: string, _stageUsage: string, toolbarUsage: ToolbarUsage, toolbarOrientation: ToolbarOrientation): CommonToolbarItem[] {
    if (toolbarUsage === ToolbarUsage.ContentManipulation && // Determines where the toolbar appears
        toolbarOrientation === ToolbarOrientation.Vertical // Determines orientation of toolbar
    ) {
      const toolbarItem = ToolbarHelper.createToolbarItemFromItemDef(
        0, // This item should have the highest priority for ordering
        getListOfFrontstagesAsGroupItemDef()
      );
      return [toolbarItem];
    }
    return [];
  }
}
