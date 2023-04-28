/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Id64String } from "@itwin/core-bentley";
import { ColorDef, FeatureOverrideType } from "@itwin/core-common";
import { EmphasizeElements, IModelApp, ViewChangeOptions } from "@itwin/core-frontend";

export interface Entity {
  id: string;
  label: string;
}

export class IotAlertApi {
  public static zoomToElements = async (elementId: string) => {
    const viewChangeOpts: ViewChangeOptions = {
      animateFrustumChange: true,
    };
    const vp = IModelApp.viewManager.selectedView;
    if (vp)
      await vp.zoomToElements(elementId, { ...viewChangeOpts });
  };
}

export class BlinkingEffect {
  private static _overrideON = true;
  private static _ids = new Set<Id64String>();

  public static doBlink = (elementId: Id64String) => {
    BlinkingEffect._ids.add(elementId);
    const vp = IModelApp.viewManager.selectedView;
    if (undefined === vp) {
      return;
    }
    const provider = EmphasizeElements.getOrCreate(vp);
    BlinkingEffect._overrideON = true;
    const timer = setInterval(() => {
      setTimeout(() => {
        provider.overrideElements(BlinkingEffect._ids, vp, ColorDef.white, FeatureOverrideType.ColorOnly, false);
      }, 1000);

      setTimeout(() => {
        provider.clearOverriddenElements(vp);
      }, 2000);

      if (!BlinkingEffect._overrideON) {
        clearInterval(timer);
      }
    }, 2000);
  };

  public static stopBlinking(elementId: Id64String) {
    BlinkingEffect._ids.delete(elementId);

    if (BlinkingEffect._ids.size === 0)
      BlinkingEffect._overrideON = false;
  }
}
