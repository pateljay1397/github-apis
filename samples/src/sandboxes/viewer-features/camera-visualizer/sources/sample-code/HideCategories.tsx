/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { IModelConnection, ViewState } from "@itwin/core-frontend";
import { Id64Array, Id64String } from "@itwin/core-bentley";

/**
 *  See https://www.itwinjs.org/sandboxes/williamkbentley/Hide%20Categories%20v2
 *  for relevant sample.
 */

class HideCategories {
  public static async overrideView(imodel: IModelConnection, viewState: ViewState) {
    const hiddenCategories = await HideCategories.getHiddenCategories(imodel);
    if (hiddenCategories)
      viewState.categorySelector.dropCategories(hiddenCategories);
  }

  private static getHiddenCategories = async (imodel: IModelConnection): Promise<Id64Array | undefined> => {
    const ids: Id64String[] = [];
    const addIdsByCategory = async (...categoryCodes: string[]) => {
      if (!imodel.isClosed) {
        const selectInCategories = `SELECT ECInstanceID FROM bis.Category WHERE CodeValue IN ('${categoryCodes.join("','")}')`;
        for await (const row of imodel.query(selectInCategories))
          ids.push(row[0]);
      }
    };

    await addIdsByCategory("Roof", "Ceiling 2nd", "Ceiling light", "Brick Exterior", "WINDOWS 2ND", "WINDOWS 1ST", "WALL 2ND", "WALL 1ST", "DRY WALL 2nd", "DRY WALL 1st", "CEILING 1st", "Utilities 2nd", "Floor 2nd", "light fixture", "level 20", "Level 4", "pendant light fixture", "Level 2");

    return ids;
  };
}

export default HideCategories;
