/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React from "react";
import { Anchor, Tag, toaster } from "@itwin/itwinui-react";
import { BlinkingEffect, IotAlertApi } from "./IotAlertApi";

export class IotAlert {
  private closeAlert: (() => void) | undefined;

  constructor(public elementId: string, public label?: string) {
  }

  public display() {
    toaster.setSettings({
      placement: "top",
      order: "descending",
    });

    const alert = toaster.warning(
      <>
        Alert! There is an issue with <Anchor onClick={async () => IotAlertApi.zoomToElements(this.elementId)}>{this.label}</Anchor>
      </>);

    this.closeAlert = alert.close;
    BlinkingEffect.doBlink(this.elementId);
  }

  public render(index: number, onRemove: (elementId: string) => void) {
    return (
      <Tag key={index} onRemove={() => onRemove(this.elementId)}>
        <Anchor onClick={async () => IotAlertApi.zoomToElements(this.elementId)}>
          {this.label}
        </Anchor>
      </Tag>);
  }

  public remove() {
    this.closeAlert && this.closeAlert();
    BlinkingEffect.stopBlinking(this.elementId);
  }
}
