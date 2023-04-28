/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { IMappingClient, Mapping, MappingUpdate } from "@itwin/grouping-mapping-widget";
import { CGroup } from "./CGroup";
import { verifyNonEmptyString, verifyODataSimpleIdentifier } from "./Utils";

export class CMapping implements Mapping {
  private _groups: CGroup[] | undefined = undefined;

  public readonly id: string;
  public mappingName: string;
  public description: string;
  public extractionEnabled: boolean;

  constructor(
    private readonly _client: IMappingClient,
    private readonly _iModelId: string,
    props: Mapping,
    lazyLoad: boolean = false
  ) {
    this.id = verifyNonEmptyString(props.id);
    this.mappingName = verifyODataSimpleIdentifier(props.mappingName);
    this.description = props.description ?? "";
    this.extractionEnabled = props.extractionEnabled ?? true;
    if (!lazyLoad) {
      this._groups = [];
    }
  }

  public async getGroups(accessToken: string): Promise<ReadonlyArray<CGroup>> {
    await this.loadGroups(accessToken);
    return this._groups!;
  }

  public async addGroup(accessToken: string, newGroup: CGroup) {
    await this.loadGroups(accessToken);
    this._groups!.push(newGroup);
  }

  public async deleteGroup(accessToken: string, groupId: string) {
    await this.loadGroups(accessToken);
    this._groups = this._groups!.filter((g) => g.id !== groupId);
  }

  private async loadGroups(accessToken: string): Promise<void> {
    if (undefined !== this._groups) {
      return;
    }

    const groups = await this._client.getGroups(accessToken, this._iModelId, this.id);
    this._groups = groups.map((g) => new CGroup(this._client, this._iModelId, this.id, g, true));
  }

  public update(props: MappingUpdate) {
    if (undefined !== props.mappingName) {
      this.mappingName = verifyODataSimpleIdentifier(props.mappingName);
    }

    if (undefined !== props.description) {
      this.description = props.description;
    }

    if (undefined !== props.extractionEnabled) {
      this.extractionEnabled = props.extractionEnabled;
    }
  }

  public createResponse(): Mapping {
    return {
      id: this.id,
      description: this.description,
      mappingName: this.mappingName,
      extractionEnabled: this.extractionEnabled,
    };
  }
}
