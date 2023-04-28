/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { CalculatedProperty, CalculatedPropertyUpdate } from "@itwin/grouping-mapping-widget";
import { verify, verifyNonEmptyString, verifyODataSimpleIdentifier } from "./Utils";

export class CCalculatedProperty implements CalculatedProperty {
  public id: string;
  public propertyName: string;
  public type: string;

  constructor(props: CalculatedProperty) {
    this.id = verifyNonEmptyString(props.id);
    this.propertyName = verifyODataSimpleIdentifier(props.propertyName);
    this.type = verify(props.type);
  }

  public update(props: CalculatedPropertyUpdate) {
    if (undefined !== props.propertyName) {
      this.propertyName = verifyODataSimpleIdentifier(props.propertyName);
    }

    if (undefined !== props.type) {
      this.type = props.type;
    }
  }

  public createResponse(): CalculatedProperty {
    return {
      id: this.id,
      propertyName: this.propertyName,
      type: this.type,
    };
  }
}
