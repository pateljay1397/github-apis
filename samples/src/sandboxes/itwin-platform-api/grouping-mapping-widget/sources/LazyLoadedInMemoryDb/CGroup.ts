/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import {
  CalculatedPropertyCreate,
  CalculatedPropertyUpdate,
  CustomCalculationCreate,
  CustomCalculationUpdate,
  DataType,
  Group,
  GroupPropertyCreate,
  GroupPropertyUpdate,
  GroupUpdate,
  IMappingClient,
  PropertyMap,
  resolveFormulaDataType
} from "@itwin/grouping-mapping-widget";
import { CCalculatedProperty } from "./CCalculatedProperty";
import { CCustomCalculation } from "./CCustomCalculation";
import { CGroupProperty } from "./CGroupProperty";
import { MappingClientError } from "./MappingClientError";
import { uuidv4, verifyNonEmptyString, verifyODataSimpleIdentifier } from "./Utils";

export class CGroup implements Group {
  private _groupProperties: CGroupProperty[] | undefined;
  private _calculatedProperties: CCalculatedProperty[] | undefined;
  private _customCalculations: CCustomCalculation[] | undefined;

  public readonly id: string;
  public groupName: string;
  public description: string;
  public query: string;

  constructor(
    private readonly _client: IMappingClient,
    private readonly _iModelId: string,
    private readonly _mappingId: string,
    props: Group,
    lazyLoad: boolean = false
  ) {
    this.id = verifyNonEmptyString(props.id);
    this.groupName = verifyODataSimpleIdentifier(props.groupName);
    this.description = props.description ?? "";
    this.query = verifyNonEmptyString(props.query);
    if (!lazyLoad) {
      this._groupProperties = [];
      this._calculatedProperties = [];
      this._customCalculations = [];
    }
  }

  public async getGroupProperties(accessToken: string): Promise<CGroupProperty[]> {
    await this.loadGroupProperties(accessToken);
    return this._groupProperties!;
  }

  public async addGroupProperty(accessToken: string, props: GroupPropertyCreate): Promise<CGroupProperty> {
    await this.loadGroupProperties(accessToken);

    this.verifyPropName(props.propertyName);
    const newProperty = new CGroupProperty({ ...props, id: uuidv4() });
    this._groupProperties!.push(newProperty);

    return newProperty;
  }

  public async deleteGroupProperty(accessToken: string, propertyId: string) {
    await this.loadGroupProperties(accessToken);
    this._groupProperties = this._groupProperties!.filter((p) => p.id !== propertyId);
  }

  public async updateGroupProperty(accessToken: string, propertyId: string, props: GroupPropertyUpdate) {
    const prop = (await this.getGroupProperties(accessToken)).find((p) => p.id === propertyId);
    if (!prop) {
      throw new MappingClientError(404, "GroupProperty not found.");
    }

    if (undefined !== props.propertyName) {
      this.verifyPropName(props.propertyName, prop.propertyName);
    }
    prop.update(props);
  }

  private async loadGroupProperties(accessToken: string): Promise<void> {
    if (undefined !== this._groupProperties) {
      return;
    }

    const props = await this._client.getGroupProperties(accessToken, this._iModelId, this._mappingId, this.id);
    this._groupProperties = props.map((p) => new CGroupProperty(p));
  }

  public async getCalculatedProperties(accessToken: string): Promise<CCalculatedProperty[]> {
    await this.loadCalculatedProperties(accessToken);
    return this._calculatedProperties!;
  }

  public async addCalculatedProperty(accessToken: string, props: CalculatedPropertyCreate): Promise<CCalculatedProperty> {
    await this.loadCalculatedProperties(accessToken);

    this.verifyPropName(props.propertyName);
    const newProp = new CCalculatedProperty({ ...props, id: uuidv4() });

    this._calculatedProperties!.push(newProp);
    return newProp;
  }

  public async deleteCalculatedProperty(accessToken: string, propertyId: string) {
    await this.loadCalculatedProperties(accessToken);
    this._calculatedProperties = this._calculatedProperties!.filter((p) => p.id !== propertyId);
  }

  public async updateCalculatedProperty(accessToken: string, propertyId: string, props: CalculatedPropertyUpdate) {
    const prop = (await this.getCalculatedProperties(accessToken)).find((p) => p.id === propertyId);
    if (!prop) {
      throw new MappingClientError(404, "CalculatedProperty not found.");
    }

    if (undefined !== props.propertyName) {
      this.verifyPropName(props.propertyName, prop.propertyName);
    }
    prop.update(props);
  }

  private async loadCalculatedProperties(accessToken: string): Promise<void> {
    if (undefined !== this._calculatedProperties) {
      return;
    }

    const props = await this._client.getCalculatedProperties(accessToken, this._iModelId, this._mappingId, this.id);
    this._calculatedProperties = props.map((p) => new CCalculatedProperty(p));
  }

  public async getCustomCalculations(accessToken: string): Promise<CCustomCalculation[]> {
    await this.loadCustomCalculations(accessToken);
    return this._customCalculations!;
  }

  public async addCustomCalculation(accessToken: string, props: CustomCalculationCreate): Promise<CCustomCalculation> {
    await this.loadCustomCalculations(accessToken);

    this.verifyPropName(props.propertyName);
    const newProperty = new CCustomCalculation({
      ...props,
      dataType: this.verifyFormula(props.formula, props.propertyName),
      id: uuidv4(),
    });

    this._customCalculations!.push(newProperty);
    return newProperty;
  }

  public async deleteCustomCalculation(accessToken: string, propertyId: string) {
    await this.loadCustomCalculations(accessToken);
    this._customCalculations = this._customCalculations!.filter((p) => p.id !== propertyId);
  }

  public async updateCustomCalculation(accessToken: string, propertyId: string, updateProps: CustomCalculationUpdate) {
    const prop = (await this.getCustomCalculations(accessToken)).find((p) => p.id === propertyId);
    if (!prop) {
      throw new MappingClientError(404, "CustomCalculation not found.");
    }

    let newName = prop.propertyName;
    if (undefined !== updateProps.propertyName) {
      newName = this.verifyPropName(updateProps.propertyName, prop.propertyName);
    }

    let dataType = prop.dataType;
    if (undefined !== updateProps.formula) {
      dataType = this.verifyFormula(updateProps.formula, newName, prop.propertyName);
    }

    prop.update(updateProps, dataType);
  }

  private createPropertyDataTypeMap(): PropertyMap {
    const map: PropertyMap = {};

    for (const gp of this._groupProperties!) {
      map[gp.propertyName.toLowerCase()] = gp.dataType as DataType;
    }

    for (const cp of this._calculatedProperties!) {
      map[cp.propertyName.toLowerCase()] = "Number";
    }

    for (const cc of this._customCalculations!) {
      map[cc.propertyName.toLowerCase()] = cc.dataType;
    }

    return map;
  }

  private verifyFormula(formula: string, newName: string, oldName?: string | undefined): DataType {
    const availableProps = this.createPropertyDataTypeMap();
    delete availableProps[newName.toLowerCase()];
    if (undefined !== oldName) {
      delete availableProps[oldName.toLowerCase()];
    }
    const dataType = resolveFormulaDataType(newName.toLowerCase(), formula, availableProps);
    if (undefined !== dataType.errorMessage) {
      throw new MappingClientError(422, dataType.errorMessage);
    }
    return dataType.value!;
  }

  private verifyPropName(newName: string | undefined, oldName?: string | undefined): string {
    const verifiedNewName = verifyODataSimpleIdentifier(newName);

    let allPropNames = this.getPropertyNames();
    if (undefined !== oldName) {
      allPropNames = allPropNames.filter((pn) => pn !== oldName.toLowerCase());
    }

    if (allPropNames.includes(verifiedNewName.toLowerCase())) {
      throw new MappingClientError(409, "Property already exists.");
    }

    return verifiedNewName;
  }

  private getPropertyNames(): string[] {
    const names: string[] = [];

    for (const gp of this._groupProperties!) {
      names.push(gp.propertyName.toLowerCase());
    }

    for (const cp of this._calculatedProperties!) {
      names.push(cp.propertyName.toLowerCase());
    }

    for (const cc of this._customCalculations!) {
      names.push(cc.propertyName.toLowerCase());
    }

    return names;
  }

  private async loadCustomCalculations(accessToken: string): Promise<void> {
    if (undefined !== this._customCalculations) {
      return;
    }

    const props = await this._client.getCustomCalculations(accessToken, this._iModelId, this._mappingId, this.id);
    this._customCalculations = props.map((p) => new CCustomCalculation(p));
  }

  public update(props: GroupUpdate) {
    if (undefined !== props.groupName) {
      this.groupName = verifyODataSimpleIdentifier(props.groupName);
    }

    if (undefined !== props.description) {
      this.description = props.description;
    }

    if (undefined !== props.query) {
      this.query = props.query;
    }
  }

  public createResponse(): Group {
    return {
      id: this.id,
      groupName: this.groupName,
      description: this.description,
      query: this.query,
    };
  }
}
