/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React from "react";
import { DbOpcode, Id64Array, Id64String } from "@itwin/core-bentley";
import { ChangedElements, ColorDef, FeatureAppearance } from "@itwin/core-common";
import { EmphasizeElements, FeatureOverrideProvider, FeatureSymbology, IModelApp, Viewport } from "@itwin/core-frontend";
import { MinimalNamedVersion } from "@itwin/imodels-client-management";
import { Small, Text, toaster } from "@itwin/itwinui-react";
import { ChangedElementsClient } from "./ChangedElementsClient";

/** Interface to configure the visualization of changed elements */
export interface ComparisonVisualizationOptions {
  showInserts: boolean;
  showUpdates: boolean;
  showUnchanged: boolean;
}

/** This provider will change the color of the elements based on the last operation of the comparison. */
class ComparisonProvider implements FeatureOverrideProvider {
  private _insertOp: Id64Array = [];
  private _updateOp: Id64Array = [];
  private static _defaultAppearance: FeatureAppearance | undefined;
  private static _transparentAppearance: FeatureAppearance | undefined;
  private static _provider: ComparisonProvider | undefined;
  private static _options: ComparisonVisualizationOptions | undefined;

  /** Creates and applies a FeatureOverrideProvider to highlight the inserted and updated element Ids */
  public static setComparison(viewport: Viewport, insertOp: Id64Array, updateOp: Id64Array): ComparisonProvider {
    ComparisonProvider.dropComparison(viewport);
    ComparisonProvider._provider = new ComparisonProvider(insertOp, updateOp);
    viewport.addFeatureOverrideProvider(ComparisonProvider._provider);
    return ComparisonProvider._provider;
  }

  /** Removes the provider form the viewport. */
  public static dropComparison(viewport: Viewport) {
    if (ComparisonProvider._provider !== undefined)
      viewport.dropFeatureOverrideProvider(ComparisonProvider._provider);
    ComparisonProvider._provider = undefined;
  }

  public static setOptions(options: ComparisonVisualizationOptions) {
    ComparisonProvider._options = options;
  }

  private constructor(insertOp: Id64Array, updateOp: Id64Array) {
    this._insertOp = insertOp;
    this._updateOp = updateOp;
  }

  /** Tells the viewport how to override the elements appearance. */
  public addFeatureOverrides(overrides: FeatureSymbology.Overrides, viewport: Viewport) {
    if (ComparisonProvider._defaultAppearance === undefined || ComparisonProvider._transparentAppearance === undefined) {
      // Copy default appearance from Emphasize Elements
      ComparisonProvider._defaultAppearance = EmphasizeElements.getOrCreate(viewport).createDefaultAppearance();
      ComparisonProvider._transparentAppearance = FeatureAppearance.fromJSON({ transparency: 1.0 });
      EmphasizeElements.clear(viewport);
    }

    const insertFeature = FeatureAppearance.fromRgb(ColorDef.green);
    const updateFeature = FeatureAppearance.fromRgb(ColorDef.blue);
    if (ComparisonProvider._options?.showInserts) {
      this._insertOp.forEach((id) => overrides.override({ elementId: id, appearance: insertFeature }));
    }
    if (ComparisonProvider._options?.showUpdates) {
      this._updateOp.forEach((id) => overrides.override({ elementId: id, appearance: updateFeature }));
    }

    overrides.setDefaultOverrides(
      ComparisonProvider._options?.showUnchanged
        ? ComparisonProvider._defaultAppearance
        : ComparisonProvider._transparentAppearance
    );
  }
}

export class ChangedElementsApi {

  /** A list of all the Named Versions and their Changeset Id for the open iModel. */
  public static namedVersions: MinimalNamedVersion[] = [];

  /** Request all the named versions of an IModel and populates the "namedVersions" list. */
  public static async populateVersions() {
    // Check if already populated
    if (this.namedVersions.length > 0) return;

    // Make request to IModelHub API for all named versions
    ChangedElementsApi.namedVersions = await ChangedElementsClient.getNamedVersions();
  }

  /** Request the Comparison and displays the changes in the Viewport. */
  public static async compareChangesets(start: Id64String, end: Id64String) {
    const vp = IModelApp.viewManager.selectedView;
    if (vp === undefined)
      return;

    // Request Changed elements
    const changedElements = await ChangedElementsClient.getChangedElements(start, end);

    // Visualize in the viewport.
    ChangedElementsApi.visualizeComparison(vp, changedElements);
  }

  /** Passes the visualization options to the provider */
  public static changeOptions(options: ComparisonVisualizationOptions) {
    const vp = IModelApp.viewManager.selectedView;
    if (vp === undefined)
      return;

    // Change options
    ComparisonProvider.setOptions(options);
    // Cause a feature override update on the viewport
    vp.setFeatureOverrideProviderChanged();
  }

  /** Parses the response from the Changed Elements API and displays changes in the Viewport using a FeatureOverridesProvider. */
  public static visualizeComparison(vp: Viewport, changedElements: ChangedElements | undefined) {
    const elementIds = changedElements?.elements;
    const opcodes = changedElements?.opcodes;
    const deleteOp: Id64Array = [];
    const insertOp: Id64Array = [];
    const updateOp: Id64Array = [];
    let msgBrief = "";
    let msgDetail = "";

    if (
      // Tests if response has valid changes
      elementIds === undefined || elementIds.length <= 0 ||
      opcodes === undefined || opcodes.length <= 0 ||
      elementIds.length !== opcodes.length
    ) {
      msgBrief = "No elements changed";
      msgDetail = "There were 0 elements changed between change sets.";
    } else {
      msgBrief = `${elementIds.length} elements changed`;
      msgDetail = `There were ${elementIds.length} elements changed between change sets.`;
      for (let i = 0; i < elementIds.length; i += 1) {
        switch (opcodes[i]) {
          case DbOpcode.Delete:
            // Deleted elements will not be represented in this sample.
            deleteOp.push(elementIds[i]);
            break;
          case DbOpcode.Insert:
            insertOp.push(elementIds[i]);
            break;
          case DbOpcode.Update:
            updateOp.push(elementIds[i]);
            break;
        }
      }
    }

    toaster.informational(
      <>
        <Text>{msgBrief}</Text>
        <Small>{msgDetail}</Small>
      </>);

    ComparisonProvider.setComparison(vp, insertOp, updateOp);
    return { elementIds, opcodes };
  }
}
