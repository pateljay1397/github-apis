/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
export class MappingClientError extends Error {
  constructor(
    public readonly status: number,
    message?: string
  ) {
    super(message);
  }
}
