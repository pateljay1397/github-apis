/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { IModelApp } from "@itwin/core-frontend";
import { MinimalRule, MinimalRun, ParamsToCreateRule, ParamsToCreateTest, ParamsToDeleteRule, ParamsToDeleteRun,
  ParamsToDeleteTest, ParamsToGetResult, ParamsToGetRule, ParamsToGetRuleList, ParamsToGetRun, ParamsToGetRunList, ParamsToGetTemplateList,
  ParamsToGetTest, ParamsToGetTestList, ParamsToRunTest, ParamsToUpdateRule, ParamsToUpdateTest, PropertyValidationClient as PVWrapper,
  ResponseFromGetResult, Rule, RuleDetails, RuleTemplate, Run, RunDetails, Test, TestDetails, TestItem, toArray } from "@itwin/property-validation-client";

/* eslint-disable @typescript-eslint/return-await */

// This class provides example calls for all property-validation-client wrapper functions but
// only a few of them are called in this sample app.
export default class ValidationClient {
  private static tokenCallback = async () => ValidationClient.getAccessToken();
  public static _instance: PVWrapper = new PVWrapper(undefined, ValidationClient.tokenCallback);

  private static async getAccessToken() {
    if (!IModelApp.authorizationClient)
      throw new Error("AuthorizationClient is not defined. Most likely IModelApp.startup was not called yet.");

    return IModelApp.authorizationClient.getAccessToken();
  }

  // Retrieves a detailed list of Property Validation runs for the specified project id.
  public static async getValidationRunsDetailed(projectId: string): Promise<RunDetails[]> {
    const params: ParamsToGetRunList = {
      urlParams: {
        projectId,
      },
    };
    return await ValidationClient._instance.runs.getRepresentationList(params);
  }

  // Retrieves a list of Property Validation rule templates for the specified project id.
  public static async getValidationRuleTemplates(projectId: string): Promise<RuleTemplate[]> {
    const params: ParamsToGetTemplateList = {
      urlParams: {
        projectId,
      },
    };
    return await toArray(ValidationClient._instance.templates.getList(params));
  }

  // Creates a Property Validation rule.
  public static async createValidationRule(params: ParamsToCreateRule): Promise<Rule> {
    return await ValidationClient._instance.rules.create(params);
  }

  // Updates a Property Validation rule.
  public static async updateValidationRule(params: ParamsToUpdateRule): Promise<Rule> {
    return await ValidationClient._instance.rules.update(params);
  }

  // Retrieves the Property Validation rule for the specified id.
  public static async getValidationRule(ruleId: string): Promise<RuleDetails> {
    const params: ParamsToGetRule = {
      ruleId,
    };
    return await ValidationClient._instance.rules.getSingle(params);
  }

  // Retrieves a minimal list of Property Validation rules for the specified project id.
  public static async getValidationRules(projectId: string): Promise<MinimalRule[]> {
    const params: ParamsToGetRuleList = {
      urlParams: {
        projectId,
      },
    };
    return await toArray(ValidationClient._instance.rules.getMinimalList(params));
  }

  // Retrieves a detailed list of Property Validation rules for the specified project id.
  public static async getValidationRulesDetailed(projectId: string): Promise<RuleDetails[]> {
    const params: ParamsToGetRuleList = {
      urlParams: {
        projectId,
      },
    };
    return await toArray(ValidationClient._instance.rules.getRepresentationList(params));
  }

  // Deletes the Property Validation rule for the specified id.
  public static async deleteValidationRule(ruleId: string): Promise<void> {
    const params: ParamsToDeleteRule = {
      ruleId,
    };
    await ValidationClient._instance.rules.delete(params);
  }

  // Creates a Property Validation test.
  public static async createValidationTest(params: ParamsToCreateTest): Promise<Test> {
    return await ValidationClient._instance.tests.create(params);
  }

  // Updates a Property Validation test.
  public static async updateValidationTest(params: ParamsToUpdateTest): Promise<Test> {
    return await ValidationClient._instance.tests.update(params);
  }

  // Retrieves the Property Validation test for the specified id.
  public static async getValidationTest(testId: string): Promise<TestDetails> {
    const params: ParamsToGetTest = {
      testId,
    };
    return await ValidationClient._instance.tests.getSingle(params);
  }

  // Retrieves a list of Property Validation tests for the specified project id.
  public static async getValidationTests(projectId: string): Promise<TestItem[]> {
    const params: ParamsToGetTestList = {
      urlParams: {
        projectId,
      },
    };
    return await toArray(ValidationClient._instance.tests.getList(params));
  }

  // Deletes the Property Validation test for the specified id.
  public static async deleteValidationTest(testId: string): Promise<void> {
    const params: ParamsToDeleteTest = {
      testId,
    };
    await ValidationClient._instance.tests.delete(params);
  }

  // Runs a Property Validation test.
  public static async runValidationTest(testId: string, iModelId: string, namedVersionId?: string): Promise<Run | undefined> {
    const params: ParamsToRunTest = {
      testId,
      iModelId,
      namedVersionId,
    };
    return await ValidationClient._instance.tests.runTest(params);
  }

  // Retrieves the Property Validation run for the specified id.
  public static async getValidationRun(runId: string): Promise<RunDetails> {
    const params: ParamsToGetRun = {
      runId,
    };
    return await ValidationClient._instance.runs.getSingle(params);
  }

  // Retrieves a minimal list of Property Validation runs for the specified project id.
  public static async getValidationRuns(projectId: string): Promise<MinimalRun[]> {
    const params: ParamsToGetRunList = {
      urlParams: {
        projectId,
      },
    };
    return await ValidationClient._instance.runs.getMinimalList(params);
  }

  // Deletes the Property Validation run (and result) for the specified run id.
  public static async deleteValidationRun(runId: string): Promise<void> {
    const params: ParamsToDeleteRun = {
      runId,
    };
    await ValidationClient._instance.runs.delete(params);
  }

  // Retrieves the Property Validation result for the specified id.
  public static async getValidationResult(resultId: string): Promise<ResponseFromGetResult> {
    const params: ParamsToGetResult = {
      resultId,
    };
    return await ValidationClient._instance.results.get(params);
  }
}
