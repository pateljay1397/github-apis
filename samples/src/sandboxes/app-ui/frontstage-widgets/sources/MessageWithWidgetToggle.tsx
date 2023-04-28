/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { WidgetState } from "@itwin/appui-abstract";
import { FrontstageManager, WidgetDef } from "@itwin/appui-react";
import { Alert, Button } from "@itwin/itwinui-react";
import React, { useEffect, useState } from "react";
import "../FrontstageWidgets.scss";

/**
 * This function returns the widget definition specified by the widget id.
 * Specifically, this sample uses the definition to toggle widget visibility.
 * @param id The widget id we would like to get the Widget Definition for.
 * @returns Returns a WidgetDef. If one could not be found, returns undefined.
 */
export const useWidgetDef = (widgetId: string): WidgetDef | undefined => {
  const frontstageDef = FrontstageManager.activeFrontstageDef;
  return frontstageDef?.findWidgetDef(widgetId);
};

export const MessageWithWidgetToggle = ({message}: {message: string}) => {
  const [widgetHidden, setWidgetHidden] = useState<boolean>(true);
  const widgetDef = useWidgetDef("UniqueWidgetIdTop");

  useEffect(() => {
    if (!widgetHidden) {
      setTimeout(() => widgetDef?.setWidgetState(WidgetState.Open));
    } else {
      setTimeout(() => widgetDef?.setWidgetState(WidgetState.Hidden));
    }
  }, [widgetHidden, widgetDef]);

  return (
    <div className="messageWithWidgetToggle">
      <Alert type="informational">
        {message}
      </Alert>
      <Button onClick={() => setWidgetHidden((prevHiddenState) => !prevHiddenState)}>
        Toggle Hidden Widget
      </Button>
    </div>
  );
};
