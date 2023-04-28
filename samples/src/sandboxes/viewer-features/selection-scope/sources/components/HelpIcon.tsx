/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React from "react";
import { SvgHelpCircularHollow } from "@itwin/itwinui-icons-react";
import { Alert, Tooltip } from "@itwin/itwinui-react";
import "../SelectionScope.scss";

interface HelpIconInterface {
  message: string;
  opaque?: boolean | undefined;
}

export const HelpIcon = ({message, opaque}: HelpIconInterface) => {
  return(
    <Tooltip
      content={
        <div>
          <Alert type="informational">
            {message}
          </Alert>
        </div>
      }
      className="tooltip"
    >
      <div className="help-icon-sizing">
        {opaque ? (
          <SvgHelpCircularHollow className="help-icon-coloring-opaque"/>
        ) : (
          <SvgHelpCircularHollow className="help-icon-coloring"/>
        )}
      </div>
    </Tooltip>
  );

};
