/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { FrontstageManager, WidgetDef } from "@itwin/appui-react";
import { IModelConnection } from "@itwin/core-frontend";
import { InstanceKey, KeySet } from "@itwin/presentation-common";
import { PresentationLabelsProvider } from "@itwin/presentation-components";
import { ElementDetails } from "../Interfaces";

// ******************** Functions for general APIs and Queries ********************

/**
 * This function returns the widget definition specified by the widget id.
 * Specifically, this sample uses the definition to toggle widget visibility.
 * @param id The widget id we would like to get the Widget Definition for.
 * @returns Returns a WidgetDef. If one could not be found, returns undefined.
 */
export const useWidgetDef = (widgetId: string): WidgetDef | undefined => {
  const frontstageDef = FrontstageManager.activeFrontstageDef;
  return frontstageDef?.findWidgetDef(widgetId);
};

/**
 * Given an element id, return that elements name.
 */
const getElementNameFromId = async (iModel: IModelConnection, elementId: string): Promise<string> => {
  const key: InstanceKey = await convertElementIdToInstanceKey(iModel, elementId);
  const presentationProvider = new PresentationLabelsProvider({ imodel: iModel });
  const elementName: string = await presentationProvider.getLabel(key);
  return elementName;
};

/**
 * Given an element id, return that elements classname.
 */
const getClassnameFromId = async (iModel: IModelConnection, elementId: string) => {
  const query = `SELECT ec_classname(ECClassId, 's:c') FROM bis.SpatialElement WHERE ECInstanceId = ${elementId}`;
  const elementAsync = iModel.query(query);
  for await (const e of elementAsync) {
    return e[0];
  }
};

/**
 * Given an array of instance keys, return an array of element names.
 * This is the way to request multiple element names at once.
 */
export const getElementNameFromInstanceKeys = async (iModel: IModelConnection, keys: InstanceKey[]): Promise<string[]> => {
  const presentationProvider = new PresentationLabelsProvider({ imodel: iModel });
  const elementNames: string[] = await presentationProvider.getLabels(keys);
  return elementNames;
};

/**
 * Given an array of element ids, return an array of instance keys.
 * Instance keys contain classname and element id information, so this is a way to request multiple classnames at once (
 * while keeping classnames synced with their element id).
 */
export const getInstanceKeysFromId = async (iModel: IModelConnection, elementIds: string[]) => {
  const query = `SELECT ECInstanceId, ec_classname(ECClassId, 's:c') FROM bis.SpatialElement WHERE ECInstanceId IN (${elementIds.join(", ")})`;
  const elementAsync = iModel.query(query);
  const instanceKeys: InstanceKey[] = [];
  for await (const e of elementAsync) {
    instanceKeys.push({
      id: e[0],
      className: e[1],
    });
  }
  return instanceKeys;
};

// ******************** Functions for Type Conversions ********************

const convertElementIdToInstanceKey = async (iModel: IModelConnection, elementId: string): Promise<InstanceKey> => {
  return (
    {
      id: elementId,
      className: await getClassnameFromId(iModel, elementId),
    }
  );
};

export const convertElementIdToKeySet = async (iModel: IModelConnection, elementId: string): Promise<KeySet> => {
  const instanceKey = await convertElementIdToInstanceKey(iModel, elementId);
  return new KeySet([instanceKey]);
};

export const convertElementIdToElementDetails = async (iModel: IModelConnection, elementId: string): Promise<ElementDetails> => {
  return {
    id: elementId,
    className: await getClassnameFromId(iModel, elementId),
    name: await getElementNameFromId(iModel, elementId),
  };
};

export const convertKeySetToElementDetails = async (iModel: IModelConnection, keySet: KeySet): Promise<ElementDetails> => {
  // For this sample, we know that the keyset should only contain one value. Therefore, we only care about the first set of keys/values.
  const [className] = keySet.instanceKeys.keys();
  const [setOfIds] = keySet.instanceKeys.values();
  const [id] = setOfIds;
  return {
    id,
    className,
    name: await getElementNameFromId(iModel, id),
  };
};

