/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Point3d, XYZProps } from "@itwin/core-geometry";
import { IModelConnection } from "@itwin/core-frontend";
import { QueryRowFormat } from "@itwin/core-common";

export interface ElementDataProps {
  id: string;
  origin: Point3d;
  bBoxHigh: XYZProps;
  bBoxLow: XYZProps;
  pitch: number;
  roll: number;
  yaw: number;
}

export const queryPitchBoundingBox = async (iModel: IModelConnection) => {
  const boxData: ElementDataProps[] = [];
  const CATEGORY_NAME_Pitch = `%SS_Pitch_Grass%`;
  const selectRelevantCategories = `select ecinstanceid from biscore.category where codevalue like '${CATEGORY_NAME_Pitch}'`;
  const selectElementsInCategories = `select ECInstanceID,Origin,Yaw,Pitch,Roll,BBoxLow,BBoxHigh from biscore.physicalelement where category.id in (${selectRelevantCategories}) Limit 1`;
  const results = iModel.query(selectElementsInCategories, undefined, { rowFormat: QueryRowFormat.UseJsPropertyNames });
  for await (const row of results) {
    boxData.push(row as ElementDataProps);
  }
  return boxData[0];
};

export const queryRailingElements = async (iModel: IModelConnection) => {
  const railingElements: string[] = [];
  const CATEGORY_NAME_Railing = `%Ground_Railing_Glass%`;
  const CATEGORY_NAME_Protection_SNet = `%SS_Pitch_Protection_SNet%`;
  const selectRelevantCategories = `select ecinstanceid from biscore.category where codevalue like '${CATEGORY_NAME_Railing}' OR codevalue like '${CATEGORY_NAME_Protection_SNet}'`;
  const selectElementsInCategories = `select ECInstanceID from biscore.physicalelement where category.id in (${selectRelevantCategories})`;
  for await (const row of iModel.query(selectElementsInCategories)) {
    railingElements.push(row[0] as string);
  }
  return railingElements;
};

export const queryDomeGlassElements = async (iModel: IModelConnection) => {
  const domeElements: string[] = [];
  const CATEGORY_NAME_Dome = `%SS_Dome%`;
  const selectRelevantCategories = `select ecinstanceid from biscore.category where codevalue like '${CATEGORY_NAME_Dome}'`;
  const selectElementsInCategories = `select ECInstanceID from biscore.physicalelement where category.id in (${selectRelevantCategories}) limit 100`;
  for await (const row of iModel.query(selectElementsInCategories)) {
    domeElements.push(row[0] as string);
  }
  return domeElements;
};

export const querySeatsOrigin = async (iModel: IModelConnection, ECInstanceID: Number) => {
  const seatsOrigin: Point3d[] = [];
  const selectRelevantOrigin = `select Origin from biscore.physicalelement where ECInstanceID = ${ECInstanceID}`;
  const results = iModel.query(selectRelevantOrigin, undefined, { rowFormat: QueryRowFormat.UseJsPropertyNames });
  for await (const row of results) {
    seatsOrigin.push(Point3d.fromJSON(row.origin));
  }
  return seatsOrigin[0];
};

export const querySeatingPlatforms = async (iModel: IModelConnection) => {
  const seatingPlatforms: string[] = [];
  const CATEGORY_NAME_Seating_Platforms = `%Seating_Platform%`;
  const CATEGORY_NAME_Pitch_ProtectionBase = `%SS_Pitch_Protection_Base%`;
  const selectRelevantCategories = `select ecinstanceid from biscore.category where codevalue like '${CATEGORY_NAME_Seating_Platforms}' or codevalue like '${CATEGORY_NAME_Pitch_ProtectionBase}'`;
  const selectElementsInCategories = `select ECInstanceID from biscore.physicalelement where category.id in (${selectRelevantCategories})`;
  for await (const row of iModel.query(selectElementsInCategories)) {
    seatingPlatforms.push(row[0] as string);
  }
  return seatingPlatforms;
};

export const queryAdvertisingBoard = async (iModel: IModelConnection) => {
  const advertisingBoard: string[] = [];
  const CATEGORY_NAME_Glasss = `%2F_Glasss%`;
  const selectRelevantCategories = `select ecinstanceid from biscore.category where codevalue like '${CATEGORY_NAME_Glasss}'`;
  const selectElementsInCategories = `select ECInstanceID from biscore.physicalelement where category.id in (${selectRelevantCategories})`;
  for await (const row of iModel.query(selectElementsInCategories)) {
    advertisingBoard.push(row[0] as string);
  }
  return advertisingBoard;
};
