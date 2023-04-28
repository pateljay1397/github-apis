/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { IModelApp } from "@itwin/core-frontend";

export interface Group {
  name: string;
  properties: any[];
}

interface href {
  href: string;
}

interface _Links {
  next: href;
  self: href;
}

interface Report {
  id: string;
  displayName: string;
  description: string;
  deleted: boolean;
  _links: {
    project: href;
  };
}

interface Entity {
  name: string;
  url: string;
}

interface GetReportsResponse {
  reports: Report[];
  _links: _Links;
}

interface GetODataResponse {
  "@odata.context": string;
  value: Entity[];
}

interface GetODataEntityResponse {
  "@odata.context": string;
  value: Object[];
  "@odata.nextLink": string;
}

export class ReportingClient {
  public static async getGroups(itwinId: string): Promise<Group[]> {
    const accesstoken = await ReportingClient.getAccessToken();
    const baseUrl = "https://api.bentley.com/insights/reporting";
    const options = {
      method: "GET",
      headers: {
        Authorization: accesstoken,
        Accept: "application/vnd.bentley.itwin-platform.v1+json",
      },
    };

    const reportUrl = `${baseUrl}/reports?projectId=${itwinId}`;
    const reports = await this.fetchApi<GetReportsResponse>(reportUrl, options);
    const reportId = reports?.reports.find(
      (r: any) => r && r.deleted === false
    )?.id;
    if (reportId === undefined) return [];

    const url = `${baseUrl}/odata/${reportId}`;
    const groupsList = await this.fetchApi<GetODataResponse>(url, options);
    if (groupsList === undefined) return [];

    const groups: Group[] = [];
    for (const group of groupsList.value) {
      const entitiesUrl = `${baseUrl}/odata/${reportId}/${group.url}`;
      let page = await this.fetchApi<GetODataEntityResponse>(
        entitiesUrl,
        options
      );

      const currentGroup: Group = {
        name: group.name.split("_").slice(1, -2).join("_"),
        properties: page?.value ?? [],
      };
      while (page?.["@odata.nextLink"]) {
        page = await this.fetchApi<GetODataEntityResponse>(
          page?.["@odata.nextLink"],
          options
        );
        if (page?.value) {
          currentGroup.properties.push(page.value);
        }
      }
      groups.push(currentGroup);
    }
    return groups;
  }

  public static async getAccessToken() {
    if (!IModelApp.authorizationClient)
      throw new Error(
        "AuthorizationClient is not defined. Most likely IModelApp.startup was not called yet."
      );

    return IModelApp.authorizationClient.getAccessToken();
  }

  public static async fetchApi<T>(
    url: string,
    options: any
  ): Promise<T | undefined> {
    return fetch(url, options)
      .then(async (response) => {
        if (response.ok) {
          return response.json() as Promise<T>;
        } else {
          throw new Error(response.statusText);
        }
      })
      .catch((error) => {
        console.error(error);
        return undefined;
      });
  }
}
