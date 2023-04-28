/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { BeEvent } from "@itwin/core-bentley";
import { Group, ReportingClient } from "./ReportingClient";
import { ColorDef, FeatureOverrideType } from "@itwin/core-common";
import {
  EmphasizeElements,
  IModelApp,
  ViewChangeOptions
} from "@itwin/core-frontend";

export class ReportingApi {
  public static selectGroup: Group;
  public static groups: Group[] = [];
  public static onReportingDataChanged = new BeEvent<any>();
  private static _applyZoom: boolean = true;

  public static async populateGroups(itwinId: string) {
    ReportingApi.groups = await ReportingClient.getGroups(itwinId);
    if (ReportingApi.groups.length > 0) {
      ReportingApi.selectGroup = ReportingApi.groups[0];
      ReportingApi.onReportingDataChanged.raiseEvent();
    }
  }

  public static enableZoom() {
    ReportingApi._applyZoom = true;
  }

  public static disableZoom() {
    ReportingApi._applyZoom = false;
  }

  public static visualizeElements(elementIds: string[]) {
    if (!IModelApp.viewManager.selectedView) return;

    const vp = IModelApp.viewManager.selectedView;
    const emph = EmphasizeElements.getOrCreate(vp);
    emph.clearEmphasizedElements(vp);
    emph.clearOverriddenElements(vp);
    emph.overrideElements(
      elementIds,
      vp,
      ColorDef.red,
      FeatureOverrideType.ColorOnly,
      true
    );
    emph.wantEmphasis = true;
    emph.emphasizeElements(elementIds, vp);

    if (ReportingApi._applyZoom) {
      const viewChangeOpts: ViewChangeOptions = {};
      viewChangeOpts.animateFrustumChange = true;
      vp.zoomToElements(elementIds, { ...viewChangeOpts }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
      });
    }
  }
}
