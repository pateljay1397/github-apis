/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { IModelConnection } from "@itwin/core-frontend";
import { HiliteSet, HiliteSetProvider, Presentation } from "@itwin/presentation-frontend";
import { ElementDetails } from "../Interfaces";
import { convertElementIdToKeySet, getElementNameFromInstanceKeys, getInstanceKeysFromId } from "./HelperFunctions";

/**
 * This class contains functions for hiliting elements
 */
export class HiliteElementsApi {
  // The existance of a HiliteSetProvider is required for calculating which elements are hilited in the iModel
  private _hiliteSetProvider: HiliteSetProvider;

  constructor(iModel: IModelConnection) {
    this._hiliteSetProvider = HiliteSetProvider.create({imodel: iModel});
  }

  /**
   * Calculate the element ids that should be hilited based only upon the passed element id.
   * @param iModel The iModel in the Viewer.
   * @param elementId The element id of the currently selected element.
   * @returns An array of element ids.
   */
  private async getHiliteSetElementIds(iModel: IModelConnection, elementId: string): Promise<string[]> {
    const keySet = await convertElementIdToKeySet(iModel, elementId);
    const hiliteSet: HiliteSet = await this._hiliteSetProvider.getHiliteSet(keySet);
    if (hiliteSet.elements !== undefined) {
      return hiliteSet.elements;
    }
    return [];
  };

  /**
   * Calculate the element ids that should be hilited based only upon the passed element id. Return these elements as ElementDetails objects.
   * @param iModel The iModel in the Viewer.
   * @param elementId The element id of the currently selected element.
   * @returns An array of ElementDetails objects.
   */
  public async getHiliteSetAsElementDetails(iModel: IModelConnection, elementId: string) {
    const hilitedElementIds = await this.getHiliteSetElementIds(iModel, elementId);
    const hilitedElements: ElementDetails[] = [];
    const instanceKeys = await getInstanceKeysFromId(iModel, hilitedElementIds);
    const names = await getElementNameFromInstanceKeys(iModel, instanceKeys);
    for (let i = 0; i < instanceKeys.length; i++) {
      hilitedElements.push({
        id: instanceKeys[i].id,
        className: instanceKeys[i].className,
        name: names[i],
      });
    }
    return hilitedElements;
  };

  /**
   * Calculate the element ids that should be hilited based on the provided elementId and scope.
   * @param iModel The iModel in the Viewer.
   * @param elementId The element id that would have been selected in Element Scope.
   * @param targetScopeId The selection scope we want to use instead of Element Scope (Element Scope may be passed here)
   *                      for deciding what should be hilited.
   * @returns An array of element ids.
   */
  public async getHiliteSetElementIdsForGivenScope(iModel: IModelConnection, elementId: string, targetScopeId: string): Promise<string[]> {
    const keySet = await Presentation.selection.scopes.computeSelection(iModel, elementId, targetScopeId);
    const hiliteSet: HiliteSet = await this._hiliteSetProvider.getHiliteSet(keySet);
    if (hiliteSet.elements !== undefined) {
      return hiliteSet.elements;
    }
    return [];
  }
}
