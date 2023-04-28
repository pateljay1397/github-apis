/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { IModelApp } from "@itwin/core-frontend";
import { GroupsResponseInterface, LinkInterface, SavedViewDetailResponseInterface, SavedViewsResponseInterface } from "./SavedViewsInterfaces";

/**
 * Fetch response interface.
 */
interface FetchResponse<T> extends Response {
  data?: T;
}

/**
 * Saved Views Client that provide methods to call saved views apis
 */
export default class SavedViewsClient {

  private static readonly BASE_URL = "https://api.bentley.com/savedviews";

  /**
   * Returns necessary options for fetch.
   * @param accessToken name of the accessToken
   * @returns RequestInit
   */
  private static buildFetchOptions(accessToken: string): RequestInit {
    return {
      method: "GET",
      headers: {
        Prefer: "return=representation",
        Accept: "application/vnd.bentley.itwin-platform.v1+json",
        Authorization: accessToken,
      },
    };
  }

  /** Returns the access token which will be used for all the API calls made by the frontend. */
  private static async getAccessToken() {
    if (!IModelApp.authorizationClient)
      throw new Error("AuthorizationClient is not defined. Most likely IModelApp.startup was not called yet.");

    return IModelApp.authorizationClient.getAccessToken();
  }

  /**
   * Fetches data from the service referenced by url.
   * @param url name of the url from where we're fetching data.
   * @returns Promise<T | undefined>
   */
  private static async getFetchResponse<T>(url: string): Promise<T | undefined> {
    const accessToken = await SavedViewsClient.getAccessToken();
    const options = this.buildFetchOptions(accessToken);
    const response: FetchResponse<T> = await fetch(url, options);
    if (response.ok) {
      response.data = await response.json();
    } else {
      console.log(`Error on fetch, ${response.status}`);
      response.data = undefined;
    }
    return response.data;
  }

  /**
   * Retrieves a list of saved Views for given iTwin and iModel.
   * @param iTwinId name of iTwin ID.
   * @param iModelId name of iModel ID.
   * @see https://developer.bentley.com/apis/savedviews/operations/get-all-savedviews/
   * @returns Promise<SavedViewsResponseInterface>
   */
  public static async getAllAsync(iTwinId: string, iModelId?: string): Promise<SavedViewsResponseInterface | undefined> {
    let url = `${this.BASE_URL}?iTwinId=${iTwinId}`;
    if (iModelId) {
      url = `${url}&iModelId=${iModelId}`;
    }
    return this.getFetchResponse<SavedViewsResponseInterface>(url);
  }

  /**
   * Get all group by iTwin ID and iModel ID.
   * @param iTwinId name of the iTwin ID.
   * @param iModelId name of the iModel ID.
   * @see https://developer.bentley.com/apis/savedviews/operations/get-all-groups/
   * @returns Promise<GroupsResponseInterface>
   */
  public static async getAllGroupsAsync(iTwinId: string, iModelId?: string): Promise<GroupsResponseInterface | undefined> {
    let url = `${this.BASE_URL}/groups?iTwinId=${iTwinId}`;
    if (iModelId) {
      url = `${url}&iModelId=${iModelId}`;
    }
    return this.getFetchResponse<GroupsResponseInterface>(url);
  }

  /**
   * Gets saved view by saved view ID.
   * @param savedViewId name of the saved view ID.
   * @see https://developer.bentley.com/apis/savedviews/operations/get-savedview/
   * @returns Promise<SavedViewDetailResponseInterface>
   */
  public static async getByIdAsync(savedViewId: string): Promise<SavedViewDetailResponseInterface | undefined> {
    const url = `${this.BASE_URL}/${savedViewId}`;
    return this.getFetchResponse<SavedViewDetailResponseInterface>(url);
  }

  /**
   * Retrieves saved view thumbnail url.
   * @param imageUrl name of the saved view image URL.
   * @see https://developer.bentley.com/apis/savedviews/operations/get-image/
   * @returns Promise<LinkInterface>
   */
  public static async getThumbnailUrlAsync(imageUrl: string): Promise<LinkInterface | undefined> {
    return this.getFetchResponse<LinkInterface>(imageUrl);
  }
}
