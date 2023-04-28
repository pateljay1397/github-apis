/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import SavedViewsClient from "./SavedViewsClient";
import { GroupsResponseInterface, LinkInterface, SavedViewDetailResponseInterface, SavedViewsResponseInterface } from "./SavedViewsInterfaces";
import { groupsList, savedViewsDetailList, savedViewsList } from "./SavedViewsJsonData";

/**
 * Saved views API get all saved views and related groups, thumbnails.
 */
export default class SavedViewsApi {

  /**
   * Gets all saved views for given Itwin ID and iModelId.
   * @param iTwinId name of the iTwin ID or Itwin ID.
   * @param iModelId name of the Imodel ID.
   * @returns Promise<SavedViewsResponseInterface>
   */
  public static async getAllAsync(
    iTwinId: string,
    iModelId?: string
  ): Promise<SavedViewsResponseInterface> {
    const svResponse = await SavedViewsClient.getAllAsync(iTwinId, iModelId);
    if (svResponse) {
      return svResponse;
    }
    return savedViewsList;
  }

  /**
   * Gets all groups by iTwinId and iModelId.
   * @param iTwinId name of the iTwinId.
   * @param iModelId name of the iModelId.
   * @returns Promise<GroupsResponseInterface>
   */
  public static async getAllGroupsAsync(iTwinId: string, iModelId?: string): Promise<GroupsResponseInterface> {
    const svResponse = await SavedViewsClient.getAllGroupsAsync(iTwinId, iModelId);
    if (svResponse) {
      return svResponse;
    }
    return groupsList;
  }

  /**
   * Gets Saved view by ID.
   * @param savedViewId name of the saved view Id.
   * @returns Promise<SavedViewDetailResponseInterface>
   */
  public static async getByIdAsync(
    savedViewId: string
  ): Promise<SavedViewDetailResponseInterface> {
    const svResponse = await SavedViewsClient.getByIdAsync(savedViewId);
    if (svResponse) {
      return svResponse;
    }
    return savedViewsDetailList[savedViewId];
  }

  /**
   * Gets thumbnail for given saved view ID.
   * @param savedViewId name of the saved view ID.
   * @returns Promise<LinkInterface>
   */
  public static async getThumbnailUrlAsync(savedViewId: string): Promise<LinkInterface | undefined> {
    return SavedViewsClient.getThumbnailUrlAsync(savedViewId);
  }
}
