/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { MappingClientError } from "./MappingClientError";

export function verify<T>(value: T): NonNullable<T> {
  if (undefined === value || null == value) {
    throw new MappingClientError(422, "Mandatory value not provided.");
  }
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  return value!;
}

export function verifyNonEmptyString(value: string | undefined): string {
  const v = verify(value);
  if (v.length === 0) {
    throw new MappingClientError(422, "Required properties are missing or invalid.");
  }
  return v;
}

export function verifyNonEmptyArray<T>(value: Array<T> | undefined): Array<T> {
  const v = verify(value);
  if (v.length === 0) {
    throw new MappingClientError(422, "Required properties are missing or invalid.");
  }
  return v;
}

// https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid/2117523#2117523
export function uuidv4() {
  return (`${[1e7]}${-1e3}${-4e3}${-8e3}${-1e11}`).replaceAll(/[018]/g, (c: any) =>
    // eslint-disable-next-line no-mixed-operators
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

// http://docs.oasis-open.org/odata/odata/v4.0/errata03/os/complete/part3-csdl/odata-v4.0-errata03-os-part3-csdl-complete.html#_SimpleIdentifier
export function verifyODataSimpleIdentifier(value?: string): string {
  const v = verify(value);
  if (!(v.length > 0 && v.length <= 128 &&
    /^[\p{L}\p{Nl}_][\p{L}\p{Nl}\p{Nd}\p{Mn}\p{Mc}\p{Pc}\p{Cf}]{0,}$/gmu.test(v)
  )) {
    throw new MappingClientError(422, "Invalid OData Simple Identifier.");
  }

  return v;
}
