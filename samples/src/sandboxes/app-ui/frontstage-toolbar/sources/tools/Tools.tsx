/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { CoreTools, CustomItemDef, GroupItemDef, ToolItemDef } from "@itwin/appui-react";
import { IModelApp } from "@itwin/core-frontend";
import { SvgChat, SvgLayers, SvgMaintenance } from "@itwin/itwinui-icons-react";
import { Alert } from "@itwin/itwinui-react";
import { SimpleCustomTool } from "./SimpleCustomTool";
import capybara from "../public/capybara.jpg";

// Run a simple custom tool
export const toolItem = () => {
  return new ToolItemDef({
    toolId: "simple-custom-tool",
    labelKey: "Simple Custom Tool",
    iconSpec: <SvgChat />,
    execute: async () => {
      void IModelApp.tools.run(SimpleCustomTool.toolId);
    },
  });
};

// Return any react node
export const customItem = () => {
  return new CustomItemDef({
    labelKey: "Custom Item",
    iconSpec: <SvgLayers />,
    popupPanelNode: (
      <div className="custom-item">
        <Alert type="informational">
          This popup can be any custom content you provide. Even an image of a capybara!
        </Alert>
        <img src={capybara} alt="Capybara relaxing by water"/>
      </div>
    ),
  });
};

// Return a small sample of default tools
export const groupItem = () => {
  return new GroupItemDef({
    groupId: "default-tools",
    labelKey: "Default Tools",
    panelLabelKey: "Default Tools",
    iconSpec: <SvgMaintenance />,
    items: [
      CoreTools.zoomViewCommand,
      CoreTools.fitViewCommand,
      CoreTools.measureDistanceToolItemDef,
    ],
  });
};
