/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React from "react";
import { AbstractWidgetProps, BadgeType, CommonToolbarItem, IconSpecUtilities, StagePanelLocation, StagePanelSection, ToolbarItemUtilities, ToolbarOrientation, ToolbarUsage, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { Alert } from "@itwin/itwinui-react";
import { ToolbarHelper } from "@itwin/appui-react";
import { customItem, groupItem, toolItem } from "./tools/Tools";
import { IModelApp } from "@itwin/core-frontend";
import "../FrontstageToolbar.scss";

/**
 * This class provides the widgets and toolbars for the Custom Toolbar Frontstage
 * More details on Toolbars can be found in the documentation (https://www.itwinjs.org/learning/ui/abstract/toolbar/)
 */
export class CustomToolbarProvider implements UiItemsProvider {
  public readonly id: string = "CustomToolbarProvider";

  public provideWidgets(stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (stageId === "sandbox:custom-toolbar-frontstage" &&
        location === StagePanelLocation.Bottom) {
      widgets.push(
        {
          id: "ToolbarWidget",
          label: "Toolbars",
          icon: IconSpecUtilities.createWebComponentIconSpec("compare.svg"),
          defaultState: WidgetState.Open,
          getWidgetContent: () => (
            <div className="padded-content">
              <Alert type="informational">
              This frontstage contains various tools that were custom defined. Try out each tool and checkout the code in CustomToolbarProvider.tsx for details on how to define your own.
              </Alert>
            </div>
          ),
        }
      );
    }
    return widgets;
  };

  /**
   * There are two helper utilities for creating a CommonToolbarItem.
   * ToolbarHelper:
   *  The ToolbarHelper creates CommonToolbarItems from one or more ItemDefs.
   *  Documentation: https://www.itwinjs.org/reference/appui-react/toolbar/toolbarhelper/
   * ToolbarItemUtilities:
   *  The ToolbarItemUtilities creates a CommonToolbarItem from the arguments passed into its functions (there is no need
   *  to have an ItemDef defined).
   *  Documentation: https://www.itwinjs.org/reference/appui-abstract/toolbar/toolbaritemutilities/
   */
  public provideToolbarButtonItems(stageId: string, _stageUsage: string, toolbarUsage: ToolbarUsage, toolbarOrientation: ToolbarOrientation): CommonToolbarItem[] {
    const toolbarItems: CommonToolbarItem[] = [];
    if (stageId === "sandbox:custom-toolbar-frontstage") {
      // Toolbars will appear in the top left
      if (toolbarUsage === ToolbarUsage.ContentManipulation) {
        if (toolbarOrientation === ToolbarOrientation.Horizontal) {
          toolbarItems.push(...ToolbarHelper.createToolbarItemsFromItemDefs([groupItem(), customItem()], 100));
        }

        if (toolbarOrientation === ToolbarOrientation.Vertical) {
          toolbarItems.push(ToolbarHelper.createToolbarItemFromItemDef(10, toolItem()));
        }
      }

      // Toolbars will appear in the top right
      if (toolbarUsage === ToolbarUsage.ViewNavigation) {
        if (toolbarOrientation === ToolbarOrientation.Horizontal) {
          const enableBackgroundMap = ToolbarItemUtilities.createActionButton("enable-map", 100, IconSpecUtilities.createWebComponentIconSpec("map.svg"), "Enable Background Map",
            (): void => {
              // If you want to know more about handling ViewFlags, checkout the "View Attributes" sample (https://www.itwinjs.org/sandboxes/iTwinPlatform/View%20Attributes)
              const vp = IModelApp.viewManager.selectedView;
              if (vp) {
                vp.viewFlags = vp.viewFlags.with("backgroundMap", true);
              }
            });

          const disableBackgroundMap = ToolbarItemUtilities.createActionButton("disable-map", 110, IconSpecUtilities.createWebComponentIconSpec("remove.svg"), "Disable Background Map",
            (): void => {
              const vp = IModelApp.viewManager.selectedView;
              if (vp) {
                vp.viewFlags = vp.viewFlags.with("backgroundMap", false);
              }
            });
          toolbarItems.push(
            ToolbarItemUtilities.createGroupButton("map-group", 100,  IconSpecUtilities.createWebComponentIconSpec("chevron-down.svg"), "Map ViewFlags", [enableBackgroundMap, disableBackgroundMap], { badgeType: BadgeType.New })
          );
        }

        /**
         * The itemPriority argument is used for ordering items within a toolbar.
         * Ordering is from lowest to highest priority value.
         * Try changing the values below to re-order the items in the toolbar.
         */
        if (toolbarOrientation === ToolbarOrientation.Vertical) {
          toolbarItems.push(ToolbarHelper.createToolbarItemFromItemDef(30, toolItem()));
          toolbarItems.push(ToolbarHelper.createToolbarItemFromItemDef(20, groupItem()));
          toolbarItems.push(ToolbarHelper.createToolbarItemFromItemDef(10, customItem()));
        }
      }
    }
    return toolbarItems;
  }
}
