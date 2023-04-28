/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { assert } from "@itwin/core-bentley";
import { ChangedElements } from "@itwin/core-common";
import { IModelApp, IModelConnection } from "@itwin/core-frontend";
import { Authorization, IModelsClient, NamedVersion, NamedVersionState, toArray } from "@itwin/imodels-client-management";

interface ProjectContext {
  iTwinId: string;
  iModelId: string;
}

export class ChangedElementsClient {

  private static async getAuthorization(): Promise<Authorization> {
    if (!IModelApp.authorizationClient)
      throw new Error("AuthorizationClient is not defined. Most likely IModelApp.startup was not called yet.");

    const token = await IModelApp.authorizationClient.getAccessToken();
    const parts = token.split(" ");
    return parts.length === 2
      ? { scheme: parts[0], token: parts[1] }
      : { scheme: "Bearer", token };
  }

  // default initialization, will be replaced when the app loads.
  private static _projectContext: ProjectContext;

  /** Creates a context with all API request will be made in. */
  public static async populateContext(iModel: IModelConnection) {
    if (ChangedElementsClient._projectContext)
      return;

    const iTwinId = iModel.iTwinId;
    const iModelId = iModel.iModelId;
    assert(iTwinId !== undefined);
    assert(iModelId !== undefined);
    ChangedElementsClient._projectContext = { iTwinId, iModelId };
  }

  /** Uses the IModelClient to the request the Named Version of the IModel. Only selects name and changeset id.  Limited to top 10 Named Versions. */
  public static async getNamedVersions(): Promise<NamedVersion[]> {
    const client = new IModelsClient();
    const iModelIterator = client.namedVersions.getRepresentationList({
      urlParams: { $top: 10 },
      iModelId: ChangedElementsClient._projectContext.iModelId,
      authorization: this.getAuthorization,
    });

    return (await toArray(iModelIterator)).filter((version) => version.state === NamedVersionState.Visible);
  }

  /** Gets the changes in version using REST API.  Will response with JSON describing changes made between the two change sets.  Pass the same changeset Id as the start and end to view the changes for that changeset.
   * Read more at {@link https://developer.bentley.com/api-groups/project-delivery/apis/changed-elements/operations/get-comparison/|developer.bentley.com}
   * @param startChangesetId The oldest changeset id to use for the comparison.
   * @param endChangesetId The newest changeset id to use for the comparison.
   * @return A OK response will be formatted as follows:
   * ```
   * {
      "changedElements": {
        "elements": ["0x30000000f69"],
        "classIds": ["0x670"],
        "opcodes": [23],
        "modelIds": ["0x20000000002"],
        "type": [1],
        "properties": [
          ["UserLabel"]
        ],
        "oldChecksums": [
          [1448094486]
        ],
        "newChecksums": [
          [362149254]
        ],
        "parentIds": ["0"],
        "parentClassIds": ["0"]
      }
    }
   * ```
   */
  public static async getChangedElements(startChangesetId: string, endChangesetId: string): Promise<ChangedElements | undefined> {
    const { iTwinId, iModelId } = ChangedElementsClient._projectContext;
    const authorization = await this.getAuthorization();

    const url = `https://api.bentley.com/changedelements/comparison?iModelId=${iModelId}&iTwinId=${iTwinId}&startChangesetId=${startChangesetId}&endChangesetId=${endChangesetId}`;

    const options = {
      method: "GET",
      headers: {
        Authorization: `${authorization.scheme} ${authorization.token}`,
        Accept: "application/vnd.bentley.itwin-platform.v1+json",
      },
    };

    return fetch(url, options)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.json();
      })
      .then((body) => body?.changedElements as ChangedElements)
      .catch((error) => {
        console.error(error);
        return undefined;
      });
  }
}
