/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React from "react";
import { AbstractWidgetProps, IconSpecUtilities, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { MessageWithWidgetToggle } from "./MessageWithWidgetToggle";
import { Alert } from "@itwin/itwinui-react";
import "../FrontstageWidgets.scss";

/**
 * This class provides the widgets for the Custom Widgets Frontstage.
 * Most of the details about widgets are contained in the widget content.
 * However, details for changing the initial size of the widget programatically at runtime can be found
 * at the bottom of the FrontstageUIApp.tsx file.
 */
export class CustomWidgetsProvider implements UiItemsProvider {
  public readonly id: string = "CustomWidgetsProvider";

  public provideWidgets(stageId: string, _stageUsage: string, location: StagePanelLocation, section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    // Only show widgets for a specific frontstage id
    if (stageId === "sandbox:custom-widgets-frontstage") {
      if (location === StagePanelLocation.Bottom) {
        widgets.push(
          {
            id: "UniqueWidgetIdBottom",
            label: "Bottom Widget",
            icon: IconSpecUtilities.createWebComponentIconSpec("details.svg"),
            defaultState: WidgetState.Open,
            getWidgetContent: () => (
              <MessageWithWidgetToggle
                message={
                  ["Click the button to toggle the top widget to be hidden or visible.",
                    "Look for the handles on the left and right sides of the Viewer.",
                    "Try dragging the left and right widgets open to see more information on widgets.",
                    "As a bonus, this frontstage provides a custom tool as the default tool (try clicking on the iModel).",
                  ].join(" ")
                }
              />
            ),
          }
        );
      }

      if (location === StagePanelLocation.Top) {
        widgets.push(
          {
            id: "UniqueWidgetIdTop",
            label: "Top Widget",
            icon: IconSpecUtilities.createWebComponentIconSpec("visibility.svg"),
            defaultState: WidgetState.Hidden,
            getWidgetContent: () => (
              <div className="padded-content">
                <Alert type="informational">
                  Any widget can be programtically hidden. See the MessageWithWidgetToggle component for details.
                </Alert>
              </div>
            ),
          }
        );
      }

      if (location === StagePanelLocation.Right) {
        if (section === StagePanelSection.Start) {
          widgets.push(
            {
              id: "UniqueWidgetIdRightStart",
              label: "Right Top Widget",
              icon: IconSpecUtilities.createWebComponentIconSpec("developer.svg"),
              defaultState: WidgetState.Closed,
              getWidgetContent: () => (
                <div className="padded-content">
                  <Alert type="informational">
                    Each panel (Top, Right, Bottom, and Left) can display two widgets at the same time.
                  </Alert>
                </div>
              ),
            }
          );
        }

        if (section === StagePanelSection.End) {
          widgets.push(
            {
              id: "UniqueWidgetIdRightBottom",
              icon: IconSpecUtilities.createWebComponentIconSpec("layers.svg"),
              label: "First Right Bottom Widget",
              defaultState: WidgetState.Closed,
              getWidgetContent: () => (
                <div className="padded-content">
                  <Alert type="informational" className="padded-content">
                    You can have more than one widget in the same position. Try clicking on the other tab to see a different widget.
                  </Alert>
                </div>
              ),
            }
          );
          widgets.push(
            {
              id: "UniqueWidgetIdRightBottomSecond",
              icon: IconSpecUtilities.createWebComponentIconSpec("model.svg"),
              label: "Second Right Bottom Widget",
              defaultState: WidgetState.Closed,
              getWidgetContent: () => (
                <div className="padded-content">
                  <Alert type="informational" className="padded-content">
                    When there is not enough space to display the full widget name, only the icon will be used.
                  </Alert>
                </div>
              ),
            }
          );
        }
      }

      if (location === StagePanelLocation.Left) {
        widgets.push(
          {
            id: "UniqueWidgetIdLeft",
            label: "Left Widget",
            icon: IconSpecUtilities.createWebComponentIconSpec("tools.svg"),
            defaultState: WidgetState.Closed,
            getWidgetContent: () => (
              <div className="padded-content">
                <Alert type="informational" className="padded-content">
                  The Viewer caches the state of your widgets.
                  Even though this widget's default state is closed, opening this widget and re-running the sample may cause this widget to remain open.
                  For better programatic control of widget visibility, try using the `Hidden` state instead.
                </Alert>
              </div>
            ),
          }
        );
      }
    }
    return widgets;
  };
}
