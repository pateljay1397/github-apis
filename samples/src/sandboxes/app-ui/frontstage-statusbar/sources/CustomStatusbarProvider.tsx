/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React from "react";
import { AbstractStatusBarItemUtilities, CommonStatusBarItem, DisplayMessageType, IconSpecUtilities, MessageSeverity, StatusBarLabelSide, StatusBarSection, UiItemsProvider } from "@itwin/appui-abstract";
import { StatusBarItemUtilities } from "@itwin/appui-react";
import { IModelApp } from "@itwin/core-frontend";
import { ScopeSelect } from "./ScopeSelect";

const actionToExecuteOnClick = () => {
  IModelApp.notifications.displayMessage(MessageSeverity.Information, "Custom Message: ", "You can use the status bar to perform custom functions.", DisplayMessageType.Toast);
};

/**
 * This class provides the status bar items for the Custom Statusbar Frontstage.
 * The Status Bar gives the user feedback about the state of an application.
 * A Status Field is an area of the Status Bar assigned to display specific feedback about the active application.
 * The Status Bar contains one or more Status Fields.
 * More documentation can be found at https://www.itwinjs.org/learning/ui/abstract/statusbar/.
 */
export class CustomStatusbarProvider implements UiItemsProvider {
  public readonly id: string = "CustomStatusbarProvider";

  /**
   * The status bar is split into 4 different sections:
   * 1. Left/Message - The default status bar uses the left section for displaying messages and for tool assistance
   * 2. Center/Stage - The default status bar uses the center section for displaying items specific to the current frontstage/task
   * 3. Right/Selection - The default status bar uses the right section for displaying details about the selection scope
   * 4. Context - This section is the right most section. The default status bar uses the right most section to show items based on the current context
   *
   * There are two helper classes for declaring status bar items:
   * 1. AbstractStatusBarItemUtilities contains a method for declaring an item that is a label or an item that performs a function when clicked.
   * 2. StatusBarItemUtilities contains a method for creating an item that is any custom content
   *
   * Items are ordered based on which section they are in and their item priority. Ordering is left to right from lowest to highest priority value.
   */
  public provideStatusBarItems(stageId: string, _stageUsage: string): CommonStatusBarItem[] {
    const statusBarItems: CommonStatusBarItem[] = [];
    if (stageId === "sandbox:custom-status-bar-frontstage") {
      statusBarItems.push(
        AbstractStatusBarItemUtilities.createActionItem(
          "sandbox:status-bar-action",
          StatusBarSection.Left,
          10,
          IconSpecUtilities.createWebComponentIconSpec("cursor-click.svg"),
          "Click icon for details",
          actionToExecuteOnClick
        )
      );
      statusBarItems.push(
        AbstractStatusBarItemUtilities.createLabelItem(
          "sandbox:status-bar-frontstage-details",
          StatusBarSection.Center,
          10,
          IconSpecUtilities.createWebComponentIconSpec("globe.svg"),
          `Frontstage Id: ${stageId}`,
          StatusBarLabelSide.Left
        )
      );
      statusBarItems.push(
        AbstractStatusBarItemUtilities.createLabelItem(
          "sandbox:status-bar-selection-scope-label",
          StatusBarSection.Right,
          10,
          "",
          "Selection scope:",
          undefined
        )
      );
      statusBarItems.push(
        StatusBarItemUtilities.createStatusBarItem(
          "sandbox:status-bar-custom-react-dropdown",
          StatusBarSection.Right,
          20,
          <ScopeSelect />
        )
      );
    }
    return statusBarItems;
  }
}
