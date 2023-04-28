/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { useActiveIModelConnection } from "@itwin/appui-react";
import { HiliteElementsApi } from "./HiliteElementsApi";

/**
 * Custom react hook for returning an instance of the HiliteElementsApi.
 * @returns A HiliteElementsApi instance.
 */
export default function useHiliteElementsApi() {
  const iModel = useActiveIModelConnection();
  if (iModel) {
    return new HiliteElementsApi(iModel);
  }
  return undefined;
}
