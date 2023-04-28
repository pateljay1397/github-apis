/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { HitDetail, IModelConnection, ToolAdmin } from "@itwin/core-frontend";
import { PresentationLabelsProvider } from "@itwin/presentation-components";
import logo from "./itwinjs-logo.png";
import ReactDOM from "react-dom";
import React from "react";

export interface TooltipCustomizeSettings {
  showImage: boolean;
  showCustomText: boolean;
  showPresentationLabel: boolean;
  showDefaultToolTip: boolean;
  customText: string;
}

/** To create the tooltip, a class needs to override ToolAdmin and getToolTip() */
class ShowcaseToolAdmin extends ToolAdmin {
  public settings: TooltipCustomizeSettings = {
    showImage: true,
    showCustomText: false,
    showPresentationLabel: false,
    showDefaultToolTip: true,
    customText: "Additional custom text",
  };

  public constructor() {
    super();
  }

  /** Uses the settings to form a custom tooltip */
  public async getToolTip(hit: HitDetail): Promise<HTMLElement | string> {
    if (!this.settings.showImage && !this.settings.showCustomText && !this.settings.showPresentationLabel && !this.settings.showDefaultToolTip)
      return "";

    let presentationLabel: string | undefined;

    if (this.settings.showPresentationLabel) {
      const className = await this.getClassnameFromId(hit.viewport.iModel, hit.sourceId);
      if (className) {
        const presentationProvider = new PresentationLabelsProvider({ imodel: hit.viewport.iModel });
        presentationLabel = await presentationProvider.getLabel({ id: hit.sourceId, className });
      }
    }

    let defaultTooltipJSX: JSX.Element | undefined;

    if (this.settings.showDefaultToolTip) {
      const rawDefaultToolTip = await super.getToolTip(hit);

      // rawDefaultToolTip could be either a HTMLElement or a string, so we need to normalize it to an HTMLElement before we can use it
      let defaultTooltip: HTMLElement | Text;
      if (typeof rawDefaultToolTip === "string") {
        defaultTooltip = document.createTextNode(rawDefaultToolTip);
      } else {
        defaultTooltip = rawDefaultToolTip;
      }

      defaultTooltipJSX = <div>
        <strong>Default Tooltip:</strong>
        <div ref={(ref) => ref?.appendChild(defaultTooltip)} />
      </div>;
    }

    const tooltipDiv = document.createElement("div");
    const tooltipBody = <>
      {this.settings.showImage && <img src={logo} alt="iTwin.js Logo" />}
      {this.settings.showPresentationLabel && <p><strong>Presentation Label:</strong> {presentationLabel ? presentationLabel : <i>none</i>}</p>}
      {this.settings.showCustomText && <p><strong>Custom Text:</strong> {this.settings.customText}</p>}
      {this.settings.showDefaultToolTip && defaultTooltipJSX}
    </>;

    ReactDOM.render(tooltipBody, tooltipDiv);
    return tooltipDiv;
  }

  // Queries the iModel for the an element's class name given an ECInstanceId
  public async getClassnameFromId(iModel: IModelConnection, id: string): Promise<string | undefined> {
    const query = `SELECT ec_classname(ECClassId, 's:c') FROM bis.SpatialElement WHERE ECInstanceId = ${id}`;
    const elementAsync = iModel.query(query);
    for await (const e of elementAsync) {
      return e[0];
    }
    return;
  }
}

export const toolAdmin = new ShowcaseToolAdmin();
