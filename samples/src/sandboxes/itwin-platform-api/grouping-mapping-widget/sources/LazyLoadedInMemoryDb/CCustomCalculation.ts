/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { CustomCalculation, CustomCalculationUpdate, DataType } from "@itwin/grouping-mapping-widget";
import { verify, verifyNonEmptyString, verifyODataSimpleIdentifier } from "./Utils";

export class CCustomCalculation implements CustomCalculation {
  public id: string;
  public propertyName: string;
  public formula: string;
  public quantityType: string;
  public dataType: DataType;

  constructor(props: CustomCalculation) {
    this.id = verifyNonEmptyString(props.id);
    this.propertyName = verifyODataSimpleIdentifier(props.propertyName);
    this.quantityType = verify(props.quantityType);
    this.formula = verifyNonEmptyString(props.formula);
    this.dataType = props.dataType as DataType;
  }

  public update(props: CustomCalculationUpdate, dataType: DataType) {
    if (undefined !== props.propertyName) {
      this.propertyName = verifyODataSimpleIdentifier(props.propertyName);
    }

    if (undefined !== props.formula) {
      this.formula = verifyNonEmptyString(props.formula);
    }

    if (undefined !== props.quantityType) {
      this.quantityType = props.quantityType;
    }

    this.dataType = dataType;
  }

  public createResponse(): CustomCalculation {
    return {
      id: this.id,
      propertyName: this.propertyName,
      quantityType: this.quantityType,
      formula: this.formula,
      dataType: this.dataType,
    };
  }
}
