/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { ECProperty, GroupProperty, GroupPropertyUpdate } from "@itwin/grouping-mapping-widget";
import { verifyNonEmptyArray, verifyNonEmptyString, verifyODataSimpleIdentifier } from "./Utils";

export class CGroupProperty implements GroupProperty {
  public id: string;
  public propertyName: string;
  public dataType: string;
  public quantityType: string;
  public ecProperties: Array<ECProperty>;

  constructor(props: GroupProperty) {
    this.id = verifyNonEmptyString(props.id);
    this.propertyName = verifyODataSimpleIdentifier(props.propertyName);
    this.dataType = verifyNonEmptyString(props.dataType);
    this.quantityType = verifyNonEmptyString(props.quantityType);
    this.ecProperties = this.verifyECProperties(props.ecProperties);
  }

  public update(props: GroupPropertyUpdate) {
    this.propertyName = verifyODataSimpleIdentifier(props.propertyName);
    this.dataType = verifyNonEmptyString(props.dataType);
    this.quantityType = verifyNonEmptyString(props.quantityType);
    this.ecProperties = this.verifyECProperties(props.ecProperties);
  }

  private verifyECProperties(ecProperties: ECProperty[] | undefined): ECProperty[] {
    return verifyNonEmptyArray(ecProperties).map((ecp) => ({
      ecSchemaName: verifyNonEmptyString(ecp.ecSchemaName),
      ecClassName: verifyNonEmptyString(ecp.ecClassName),
      ecPropertyName: verifyNonEmptyString(ecp.ecPropertyType),
      ecPropertyType: verifyNonEmptyString(ecp.ecPropertyType),
    }));
  }

  public createResponse(): GroupProperty {
    return {
      id: this.id,
      propertyName: this.propertyName,
      dataType: this.dataType,
      quantityType: this.quantityType,
      ecProperties: this.ecProperties.map((ecp) => ({...ecp})),
    };
  }
}
