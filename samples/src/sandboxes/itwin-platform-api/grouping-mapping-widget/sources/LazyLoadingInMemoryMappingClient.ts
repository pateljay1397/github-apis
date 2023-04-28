/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import {
  CalculatedProperty,
  CalculatedPropertyCreate,
  CalculatedPropertySingle,
  CalculatedPropertyUpdate,
  CustomCalculation,
  CustomCalculationCreate,
  CustomCalculationSingle,
  CustomCalculationUpdate,
  Group,
  GroupCreate,
  GroupProperty,
  GroupPropertyCreate,
  GroupPropertySingle,
  GroupPropertyUpdate,
  GroupSingle,
  GroupUpdate,
  IMappingClient,
  Mapping,
  MappingCopy,
  MappingCreate,
  MappingSingle,
  MappingUpdate
} from "@itwin/grouping-mapping-widget";
import { CMapping } from "./LazyLoadedInMemoryDb/CMapping";
import { uuidv4 } from "./LazyLoadedInMemoryDb/Utils";
import { CGroup } from "./LazyLoadedInMemoryDb/CGroup";
import { MappingClientError } from "./LazyLoadedInMemoryDb/MappingClientError";

export class LazyLoadingInMemoryMappingClient implements IMappingClient {
  // Key - iModelId.
  private readonly _iModelMappings: Map<string, CMapping[]> = new Map<string, CMapping[]>();

  constructor(
    private readonly _client: IMappingClient
  ) { }

  public async getMappings(accessToken: string, iModelId: string): Promise<Mapping[]> {
    await this.loadIModelMappings(accessToken, iModelId);
    return this._iModelMappings.get(iModelId)!
      .map((m) => m.createResponse());
  }

  public async getMapping(accessToken: string, mappingId: string, iModelId: string): Promise<MappingSingle> {
    const mapping = await this.getCMapping(accessToken, iModelId, mappingId);

    return { mapping: mapping.createResponse() };
  }

  public async createMapping(accessToken: string, iModelId: string, mapping: MappingCreate): Promise<MappingSingle> {
    await this.loadIModelMappings(accessToken, iModelId);

    const iModelMappings = this._iModelMappings.get(iModelId)!;
    const newMapping = new CMapping(
      this._client,
      iModelId,
      { ...mapping, id: uuidv4() }
    );
    iModelMappings.push(newMapping);

    return this.getMapping(accessToken, newMapping.id, iModelId);
  }

  public async updateMapping(accessToken: string, iModelId: string, mappingId: string, mapping: MappingUpdate): Promise<MappingSingle> {
    const dbMapping = await this.getCMapping(accessToken, iModelId, mappingId);
    dbMapping.update(mapping);
    return this.getMapping(accessToken, mappingId, iModelId);
  }

  public async deleteMapping(accessToken: string, iModelId: string, mappingId: string): Promise<Response> {
    await this.loadIModelMappings(accessToken, iModelId);

    const iModelMappings = this._iModelMappings.get(iModelId)!;
    this._iModelMappings.set(iModelId, iModelMappings.filter((m) => m.id !== mappingId));

    return Promise.resolve({ ok: true, status: 204 } as Response);
  }

  public async copyMapping(accessToken: string, iModelId: string, mappingId: string, mappingCopy: MappingCopy): Promise<MappingSingle> {
    await this.loadIModelMappings(accessToken, mappingCopy.targetIModelId);

    const mapping = await this.getCMapping(accessToken, iModelId, mappingId);

    const newMapping = new CMapping(
      this._client,
      mappingCopy.targetIModelId,
      { ...mapping.createResponse(), id: uuidv4() }
    );
    if (undefined !== mappingCopy.mappingName) {
      newMapping.mappingName = mappingCopy.mappingName;
    }

    for (const group of await mapping.getGroups(accessToken)) {
      const newGroup = new CGroup(
        this._client,
        mappingCopy.targetIModelId,
        newMapping.id,
        { ...group.createResponse(), id: uuidv4() }
      );
      await newMapping.addGroup(accessToken, newGroup);

      for (const prop of await group.getGroupProperties(accessToken)) {
        await newGroup.addGroupProperty(accessToken, prop);
      }

      for (const prop of await group.getCalculatedProperties(accessToken)) {
        await newGroup.addCalculatedProperty(accessToken, prop);
      }

      for (const prop of await group.getCustomCalculations(accessToken)) {
        await newGroup.addCustomCalculation(accessToken, prop);
      }
    }

    this._iModelMappings.get(mappingCopy.targetIModelId)!.push(newMapping);
    return this.getMapping(accessToken, newMapping.id, mappingCopy.targetIModelId);
  }

  public async getGroups(accessToken: string, iModelId: string, mappingId: string): Promise<Group[]> {
    const mapping = await this.getCMapping(accessToken, iModelId, mappingId);

    return (await mapping.getGroups(accessToken))
      .map((g) => g.createResponse());
  }

  public async createGroup(accessToken: string, iModelId: string, mappingId: string, group: GroupCreate): Promise<GroupSingle> {
    const mapping = await this.getCMapping(accessToken, iModelId, mappingId);

    const newGroup = new CGroup(
      this._client,
      iModelId,
      mappingId,
      { ...group, id: uuidv4() }
    );
    await mapping.addGroup(accessToken, newGroup);

    return this.getGroup(accessToken, iModelId, mappingId, newGroup.id);
  }

  public async getGroup(accessToken: string, iModelId: string, mappingId: string, groupId: string): Promise<GroupSingle> {
    const group = await this.getCGroup(accessToken, iModelId, mappingId, groupId);
    return { group: group.createResponse() };
  }

  public async updateGroup(accessToken: string, iModelId: string, mappingId: string, groupId: string, group: GroupUpdate): Promise<GroupSingle> {
    const dbGroup = await this.getCGroup(accessToken, iModelId, mappingId, groupId);
    dbGroup.update(group);
    return this.getGroup(accessToken, iModelId, mappingId, groupId);
  }

  public async deleteGroup(accessToken: string, iModelId: string, mappingId: string, groupId: string): Promise<Response> {
    const mapping = await this.getCMapping(accessToken, iModelId, mappingId);
    await mapping.deleteGroup(accessToken, groupId);
    return Promise.resolve({ ok: true, status: 204 } as Response);
  }

  public async getGroupProperties(accessToken: string, iModelId: string, mappingId: string, groupId: string): Promise<GroupProperty[]> {
    const group = await this.getCGroup(accessToken, iModelId, mappingId, groupId);
    return (await group.getGroupProperties(accessToken))
      .map((gp) => gp.createResponse());
  }

  public async getGroupProperty(accessToken: string, iModelId: string, mappingId: string, groupId: string, propertyId: string): Promise<GroupPropertySingle> {
    const props = await this.getGroupProperties(accessToken, iModelId, mappingId, groupId);
    const prop = props.find((p) => p.id === propertyId);
    if (!prop) {
      throw new MappingClientError(404, "GroupProperty not found.");
    }

    return { property: prop };
  }

  public async createGroupProperty(accessToken: string, iModelId: string, mappingId: string, groupId: string, groupProperty: GroupPropertyCreate): Promise<GroupPropertySingle> {
    const group = await this.getCGroup(accessToken, iModelId, mappingId, groupId);
    const newProp = await group.addGroupProperty(accessToken, groupProperty);
    return this.getGroupProperty(accessToken, iModelId, mappingId, groupId, newProp.id);
  }

  public async updateGroupProperty(accessToken: string, iModelId: string, mappingId: string, groupId: string, groupPropertyId: string, groupProperty: GroupPropertyUpdate): Promise<GroupPropertySingle> {
    const group = await this.getCGroup(accessToken, iModelId, mappingId, groupId);
    await group.updateGroupProperty(accessToken, groupPropertyId, groupProperty);
    return this.getGroupProperty(accessToken, iModelId, mappingId, groupId, groupPropertyId);
  }

  public async deleteGroupProperty(accessToken: string, iModelId: string, mappingId: string, groupId: string, groupPropertyId: string): Promise<Response> {
    const group = await this.getCGroup(accessToken, iModelId, mappingId, groupId);
    await group.deleteGroupProperty(accessToken, groupPropertyId);
    return Promise.resolve({ ok: true, status: 204 } as Response);
  }

  public async getCalculatedProperties(accessToken: string, iModelId: string, mappingId: string, groupId: string): Promise<CalculatedProperty[]> {
    const group = await this.getCGroup(accessToken, iModelId, mappingId, groupId);

    return (await group.getCalculatedProperties(accessToken))
      .map((gp) => gp.createResponse());
  }

  public async getCalculatedProperty(accessToken: string, iModelId: string, mappingId: string, groupId: string, propertyId: string): Promise<CalculatedPropertySingle> {
    const props = await this.getCalculatedProperties(accessToken, iModelId, mappingId, groupId);
    const prop = props.find((p) => p.id === propertyId);
    if (!prop) {
      throw new MappingClientError(404, "CalculatedProperty not found.");
    }

    return { property: prop };
  }

  public async createCalculatedProperty(accessToken: string, iModelId: string, mappingId: string, groupId: string, property: CalculatedPropertyCreate): Promise<CalculatedPropertySingle> {
    const group = await this.getCGroup(accessToken, iModelId, mappingId, groupId);
    const newProp = await group.addCalculatedProperty(accessToken, property);
    return this.getCalculatedProperty(accessToken, iModelId, mappingId, groupId, newProp.id);
  }

  public async updateCalculatedProperty(accessToken: string, iModelId: string, mappingId: string, groupId: string, propertyId: string, property: CalculatedPropertyUpdate): Promise<CalculatedPropertySingle> {
    const group = await this.getCGroup(accessToken, iModelId, mappingId, groupId);
    await group.updateCalculatedProperty(accessToken, propertyId, property);
    return this.getCalculatedProperty(accessToken, iModelId, mappingId, groupId, propertyId);
  }

  public async deleteCalculatedProperty(accessToken: string, iModelId: string, mappingId: string, groupId: string, propertyId: string): Promise<Response> {
    const group = await this.getCGroup(accessToken, iModelId, mappingId, groupId);
    await group.deleteCalculatedProperty(accessToken, propertyId);
    return Promise.resolve({ ok: true, status: 204 } as Response);
  }

  public async getCustomCalculations(accessToken: string, iModelId: string, mappingId: string, groupId: string): Promise<CustomCalculation[]> {
    const group = await this.getCGroup(accessToken, iModelId, mappingId, groupId);

    return (await group.getCustomCalculations(accessToken))
      .map((gp) => gp.createResponse());
  }

  public async getCustomCalculation(accessToken: string, iModelId: string, mappingId: string, groupId: string, propertyId: string): Promise<CustomCalculationSingle> {
    const props = await this.getCustomCalculations(accessToken, iModelId, mappingId, groupId);
    const prop = props.find((p) => p.id === propertyId);
    if (!prop) {
      throw new MappingClientError(404, "CustomCalculation not found.");
    }

    return { customCalculation: prop };
  }

  public async createCustomCalculation(accessToken: string, iModelId: string, mappingId: string, groupId: string, property: CustomCalculationCreate): Promise<CustomCalculationSingle> {
    const group = await this.getCGroup(accessToken, iModelId, mappingId, groupId);
    const newProp = await group.addCustomCalculation(accessToken, property);
    return this.getCustomCalculation(accessToken, iModelId, mappingId, groupId, newProp.id);
  }

  public async updateCustomCalculation(accessToken: string, iModelId: string, mappingId: string, groupId: string, propertyId: string, property: CustomCalculationUpdate): Promise<CustomCalculationSingle> {
    const group = await this.getCGroup(accessToken, iModelId, mappingId, groupId);
    await group.updateCustomCalculation(accessToken, propertyId, property);
    return this.getCustomCalculation(accessToken, iModelId, mappingId, groupId, propertyId);
  }

  public async deleteCustomCalculation(accessToken: string, iModelId: string, mappingId: string, groupId: string, propertyId: string): Promise<Response> {
    const group = await this.getCGroup(accessToken, iModelId, mappingId, groupId);
    await group.deleteCustomCalculation(accessToken, propertyId);
    return Promise.resolve({ ok: true, status: 204 } as Response);
  }

  private async loadIModelMappings(accessToken: string, iModelId: string): Promise<void> {
    if (this._iModelMappings.has(iModelId)) {
      return;
    }

    const mappings = (await this._client.getMappings(accessToken, iModelId))
      .map((m) => new CMapping(this._client, iModelId, m, true));
    this._iModelMappings.set(iModelId, mappings);
  }

  private async getCMapping(accessToken: string, iModelId: string, mappingId: string): Promise<CMapping> {
    if (!this._iModelMappings.has(iModelId)) {
      await this.loadIModelMappings(accessToken, iModelId);
    }

    const iModelMappings = this._iModelMappings.get(iModelId)!;
    const mapping = iModelMappings.find((m) => m.id === mappingId);
    if (!mapping) {
      throw new MappingClientError(404, "Mapping not found.");
    }

    return mapping;
  }

  private async getCGroup(accessToken: string, iModelId: string, mappingId: string, groupId: string): Promise<CGroup> {
    const mapping = await this.getCMapping(accessToken, iModelId, mappingId);
    const group = (await mapping.getGroups(accessToken)).find((g) => g.id === groupId);
    if (!group) {
      throw new MappingClientError(404, "Group not found.");
    }

    return group;
  }
}
