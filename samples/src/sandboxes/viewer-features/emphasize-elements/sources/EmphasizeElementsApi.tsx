/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { ColorDef, FeatureOverrideType } from "@itwin/core-common";
import { EmphasizeElements, ScreenViewport } from "@itwin/core-frontend";

// START API
export class EmphasizeElementsApi {

  // START EMPHASIZE
  public static emphasizeSelectedElements(vp: ScreenViewport) {
    const provider = EmphasizeElements.getOrCreate(vp);
    provider.emphasizeSelectedElements(vp);
  }

  public static clearEmphasizedElements(vp: ScreenViewport) {
    const provider = EmphasizeElements.getOrCreate(vp);
    provider.clearEmphasizedElements(vp);
  }
  // END EMPHASIZE

  // START HIDE
  public static hideSelectedElements(vp: ScreenViewport) {
    const provider = EmphasizeElements.getOrCreate(vp);
    provider.hideSelectedElements(vp);
  }

  public static clearHiddenElements(vp: ScreenViewport) {
    const provider = EmphasizeElements.getOrCreate(vp);
    provider.clearHiddenElements(vp);
  }
  // END HIDE

  // START ISOLATE
  public static isolateSelectedElements(vp: ScreenViewport) {
    const provider = EmphasizeElements.getOrCreate(vp);
    provider.isolateSelectedElements(vp);
  }

  public static clearIsolatedElements(vp: ScreenViewport) {
    const provider = EmphasizeElements.getOrCreate(vp);
    provider.clearIsolatedElements(vp);
  }
  // END ISOLATE

  // START OVERRIDE
  public static overrideSelectedElements(colorValue: ColorDef, vp: ScreenViewport) {
    const provider = EmphasizeElements.getOrCreate(vp);
    provider.overrideSelectedElements(vp, colorValue, FeatureOverrideType.ColorOnly, false, true);
  }

  public static clearOverriddenElements(vp: ScreenViewport) {
    const provider = EmphasizeElements.getOrCreate(vp);
    provider.clearOverriddenElements(vp);
  }
  // END OVERRIDE
}
// END API
