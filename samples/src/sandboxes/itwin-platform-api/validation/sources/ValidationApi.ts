/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { BeEvent } from "@itwin/core-bentley";
import { ColorDef, FeatureOverrideType, GeometricElement3dProps, Placement3d } from "@itwin/core-common";
import { EmphasizeElements, IModelApp, IModelConnection, ViewChangeOptions } from "@itwin/core-frontend";
import { Point3d } from "@itwin/core-geometry";
import { ResponseFromGetResult, RuleDetails } from  "@itwin/property-validation-client";
import { MarkerData, MarkerPinDecorator } from "./common/marker-pin/MarkerPinDecorator";
import ValidationClient from "./ValidationClient";

export interface ValidationData {
  validationData: ResponseFromGetResult;
  ruleData: Record<string, RuleDetails | undefined>;
}

export default class ValidationApi {

  public static onTestsDataChanged = new BeEvent<any>();
  public static onRunsDataChanged = new BeEvent<any>();
  public static onResultsDataChanged = new BeEvent<any>();
  public static onRulesDataChanged = new BeEvent<any>();
  public static onTestIdChanged = new BeEvent<(projectId: string, testId: string) => void>();
  public static onRunIdChanged = new BeEvent<(resultId: string | undefined) => void>();
  public static onMarkerClicked = new BeEvent<(data: string | undefined) => void>();
  private static _validationTests: { [id: string]: any } = {};
  private static _validationTestRuns: { [id: string]: any } = {};
  private static _validationRuns: { [id: string]: any } = {};
  private static _validationResults: { [id: string]: any } = {};
  private static _validationRules: { [id: string]: any } = {};
  private static _validationResultRules: { [id: string]: any } = {};

  // Get/set validation tests
  public static async setValidationTests(projectId: string): Promise<void> {
    const tests = await ValidationApi.getValidationTests(projectId);
    ValidationApi.onTestsDataChanged.raiseEvent(tests);
    let testId;
    if (tests && tests.length) {
      testId = tests[0].id;
    }
    ValidationApi.onTestIdChanged.raiseEvent(projectId, testId);
  }
  public static async getValidationTests(projectId: string): Promise<any> {
    if (ValidationApi._validationTests[projectId] === undefined) {
      ValidationApi._validationTests[projectId] = await ValidationClient.getValidationTests(projectId);
    }
    return ValidationApi._validationTests[projectId];
  }

  // Get/set validation rules
  public static async setValidationRules(projectId: string): Promise<void> {
    const rules = await ValidationApi.getValidationRules(projectId);
    ValidationApi.onRulesDataChanged.raiseEvent(rules);
  }
  public static async getValidationRules(projectId: string): Promise<any> {
    if (ValidationApi._validationRules[projectId] === undefined) {
      ValidationApi._validationRules[projectId] = await ValidationClient.getValidationRulesDetailed(projectId);
    }
    return ValidationApi._validationRules[projectId];
  }

  // Get/set all validation runs of a specified test
  public static async setValidationRuns(projectId: string, testId: string): Promise<void> {
    const runs = await ValidationApi.getValidationRuns(projectId, testId);
    ValidationApi.onRunsDataChanged.raiseEvent(runs);
    if (runs && runs.length) {
      ValidationApi.onRunIdChanged.raiseEvent(runs[0].resultId);
    } else {
      ValidationApi.onRunIdChanged.raiseEvent(undefined);
    }
  }
  public static async getValidationRuns(projectId: string, testId: string): Promise<any> {
    const testRuns: any[] = [];
    if (ValidationApi._validationRuns[projectId] === undefined) {
      ValidationApi._validationRuns[projectId] = await ValidationClient.getValidationRunsDetailed(projectId);
    }
    if (ValidationApi._validationTestRuns[testId] === undefined) {
      const validationRuns = ValidationApi._validationRuns[projectId];
      if (validationRuns !== undefined) {
        for (const run of validationRuns) {
          const testLink = run._links.test.href;
          const testLinkId = testLink.split("/").slice(-1)[0];
          if (testId === testLinkId) {
            testRuns.push(run);
          }
        }
        ValidationApi._validationTestRuns[testId] = testRuns;
      }
    }
    return ValidationApi._validationTestRuns[testId];
  }

  // Get/set validation results by result id
  public static async setValidationResults(resultId: string | undefined): Promise<void> {
    if (resultId) {
      const resultsData = await ValidationApi.getValidationResults(resultId);
      const resultRules = await ValidationApi.getValidationResultRules(resultId);
      const validationData = {resultsData, resultRules};
      ValidationApi.onResultsDataChanged.raiseEvent(validationData);
    } else {
      ValidationApi.onResultsDataChanged.raiseEvent(undefined);
    }
  }
  public static async getValidationResults(resultId: string): Promise<any> {
    if (ValidationApi._validationResults[resultId] === undefined) {
      const resultResponse = await ValidationClient.getValidationResult(resultId);
      ValidationApi._validationResults[resultId] = resultResponse;
    }
    return ValidationClient.getValidationResult(resultId);
  }
  public static async getValidationResultRules(resultId: string): Promise<any> {
    const resultRules: any[] = [];
    if (ValidationApi._validationResultRules[resultId] === undefined) {
      const resultsData = await ValidationApi.getValidationResults(resultId);
      // Get the list of rules associated with the results
      for (const rule of resultsData.ruleList) {
        const ruleId = rule.id.toString();
        const ruleData = await ValidationClient.getValidationRule(ruleId);
        ruleData.id = ruleId;
        resultRules.push(ruleData);
      }
      ValidationApi._validationResultRules[resultId] = resultRules;
    }
    return ValidationApi._validationResultRules[resultId];
  }

  public static setupDecorator() {
    return new MarkerPinDecorator();
  }

  public static setDecoratorPoints(markersData: MarkerData[], decorator: MarkerPinDecorator, image: HTMLImageElement) {
    decorator.setMarkersData(markersData, image, ValidationApi.visualizeViolationCallback);
  }

  public static enableDecorations(decorator: MarkerPinDecorator) {
    if (!IModelApp.viewManager.decorators.includes(decorator))
      IModelApp.viewManager.addDecorator(decorator);
  }

  public static disableDecorations(decorator: MarkerPinDecorator) {
    IModelApp.viewManager.dropDecorator(decorator);
  }

  public static async getValidationMarkersData(
    imodel: IModelConnection,
    validationData: ResponseFromGetResult,
    ruleData: any): Promise<MarkerData[]> {
    const markersData: MarkerData[] = [];

    if (validationData && validationData.result && ruleData && validationData.result.length > 0) {
      const validationResults = validationData.result;
      const elements: string[] = validationResults.map((validation: any) => validation.elementId);
      const points = await ValidationApi.calcValidationCenter(imodel, elements);

      for (let index = 0; index < points.length; index++) {
        const title = "Rule Violation(s) found:";
        const ruleId = validationData.ruleList[+validationResults[index].ruleIndex].id;
        const currentRuleData = ruleData.find((rule: any) => rule.id === ruleId);
        let description = "";
        if (currentRuleData) {
          if (currentRuleData.functionParameters.lowerBound) {
            if (currentRuleData.functionParameters.upperBound) {
              // Range of values
              description = `${currentRuleData.functionParameters.propertyName} must be within range ${currentRuleData.functionParameters.lowerBound} and ${currentRuleData.functionParameters.upperBound}. Element ${validationResults[index].elementLabel} has a ${currentRuleData.functionParameters.propertyName} value of ${validationResults[index].badValue}.`;
            } else {
              // Value has a lower bound
              description = `${currentRuleData.functionParameters.propertyName} must be greater than ${currentRuleData.functionParameters.lowerBound}. Element ${validationResults[index].elementLabel} has a ${currentRuleData.functionParameters.propertyName} value of ${validationResults[index].badValue}.`;
            }
          } else {
            // Value needs to be defined
            description = `${currentRuleData.functionParameters.propertyName} must be defined. Element ${validationResults[index].elementLabel} has a ${currentRuleData.functionParameters.propertyName} value of ${validationResults[index].badValue}.`;
          }
        }
        const validationMarkerData: MarkerData = { point: points[index], data: validationResults[index], title, description };
        markersData.push(validationMarkerData);
      }
    }
    return markersData;
  }

  private static async calcValidationCenter(imodel: IModelConnection, elementIds: string[]): Promise<Point3d[]> {
    const allElementIds = [...elementIds];

    const elemProps = (await imodel.elements.getProps(allElementIds)) as GeometricElement3dProps[];
    const intersections: Point3d[] = [];
    if (elemProps.length !== 0) {

      for (const elementId of elementIds) {
        const element = elemProps.find((prop) => prop.id === elementId);
        if (element) {
          const placement = Placement3d.fromJSON(element.placement);
          intersections.push(placement.calculateRange().center);
        }
      }
    }

    return intersections;
  }

  public static visualizeViolationCallback = (validationData: any) => {
    ValidationApi.visualizeViolation(validationData.elementId, true);
  };

  public static visualizeViolation(elementId: string, isMarkerClick: boolean) {
    if (!IModelApp.viewManager.selectedView)
      return;

    const vp = IModelApp.viewManager.selectedView;
    const provider = EmphasizeElements.getOrCreate(vp);
    provider.clearEmphasizedElements(vp);
    provider.clearOverriddenElements(vp);
    provider.overrideElements(elementId, vp, ColorDef.red, FeatureOverrideType.ColorOnly, true);
    provider.wantEmphasis = true;
    provider.emphasizeElements([elementId], vp, undefined, false);

    const viewChangeOpts: ViewChangeOptions = {};
    viewChangeOpts.animateFrustumChange = true;
    vp.zoomToElements([elementId], { ...viewChangeOpts })
      .catch((error: any) => {
        console.error(error);
      });
    if (isMarkerClick) {
      ValidationApi.onMarkerClicked.raiseEvent(elementId);
    }
  }

  public static resetDisplay() {
    if (!IModelApp.viewManager.selectedView)
      return;

    const vp = IModelApp.viewManager.selectedView;
    const provider = EmphasizeElements.getOrCreate(vp);
    provider.clearEmphasizedElements(vp);
    provider.clearOverriddenElements(vp);
    ValidationApi.onMarkerClicked.raiseEvent(undefined);
  }
}
