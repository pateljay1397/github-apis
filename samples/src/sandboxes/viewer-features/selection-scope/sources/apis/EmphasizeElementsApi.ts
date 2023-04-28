/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { EmphasizeElements, IModelConnection, ScreenViewport } from "@itwin/core-frontend";
import { SelectionScope } from "@itwin/presentation-common";
import { HiliteElementsApi } from "./HiliteElementsApi";

export class EmphasizeElementsApi {
  public static async recalculateEmphasis(iModel: IModelConnection, viewport: ScreenViewport, elementId: string, scope: SelectionScope) {
    const hiliteElementsApi = new HiliteElementsApi(iModel);
    const emphasizeElementsProvider = EmphasizeElements.getOrCreate(viewport);
    // Calculate new elements to emphasize
    const hilitedElements = await hiliteElementsApi.getHiliteSetElementIdsForGivenScope(iModel, elementId, scope.id);
    // Remove emphasis from old elements
    emphasizeElementsProvider.clearEmphasizedElements(viewport);
    // Apply emphasis to new elements
    emphasizeElementsProvider.emphasizeElements(hilitedElements, viewport);
  }

  public static clearEmphasizedElements(viewport: ScreenViewport) {
    const emphasizeElementsProvider = EmphasizeElements.getOrCreate(viewport);
    emphasizeElementsProvider.clearEmphasizedElements(viewport);
  }
}
