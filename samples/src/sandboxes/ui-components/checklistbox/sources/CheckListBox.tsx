/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React from "react";
import { Checkbox, InputGroup } from "@itwin/itwinui-react";
import { ITwinLayout } from "./itwinui-demo/Layout";

// Demonstrates iTwinUI react components
// For more information please visit official repository in Github:
// https://github.com/iTwin/iTwinUI-react

const defaultCheckbox = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/input-checkbox--basic",
  component: () =>
    <div className="component-group">
      <Checkbox label="Basic Checkbox" />
      <Checkbox defaultChecked label="Default Checked" />
    </div>,
};

const disabledCheckbox = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/input-checkbox--disabled",
  component: () =>
    <Checkbox disabled={true} label="Disabled Checkbox" />,
};

const indeterminateCheckbox = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/input-checkbox--indeterminate",
  component: () =>
    <Checkbox indeterminate label="Indeterminate Checkbox" />,
};

const positiveCheckbox = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/input-checkbox--positive",
  component: () =>
    <Checkbox status="positive" label="Positive Checkbox" />,
};

const warningCheckbox = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/input-checkbox--warning",
  component: () =>
    <Checkbox status="warning" label="Warning Checkbox" />,
};

const negativeCheckbox = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/input-checkbox--negative",
  component: () =>
    <Checkbox status="warning" label="Negative Checkbox" />,
};

const loadingCheckbox = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/input-checkbox--loading",
  component: () =>
    <Checkbox status="warning" label="Loading Checkbox" />,
};

const visibilityCheckbox = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/input-checkbox--visibility",
  component: () =>
    <Checkbox variant={"eyeball"} label="Visibility Checkbox" />,
};

const checkboxGroup = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/input-inputgroup--checkbox-group",
  component: () =>
    <InputGroup
      displayStyle="default"

      label="Select your hobbies"
      message="Choose some hobbies"
    >
      <Checkbox indeterminate />
      <Checkbox label="Football" />
      <Checkbox label="Hockey" />
    </InputGroup>,
};

const App = () => <ITwinLayout
  headline="Different styles of checkboxes to be used in iTwin.js applications"
  components={[
    { title: "Default Checkbox", component: defaultCheckbox },
    { title: "Disabled Checkbox", component: disabledCheckbox },
    { title: "Indeterminate Checkbox", component: indeterminateCheckbox },
    { title: "Positive Checkbox", component: positiveCheckbox },
    { title: "Warning Checkbox", component: warningCheckbox },
    { title: "Negative Checkbox", component: negativeCheckbox },
    { title: "Loading Checkbox", component: loadingCheckbox },
    { title: "Visibility Control Checkbox", component: visibilityCheckbox },
    { title: "Group of Checkboxes", component: checkboxGroup },
  ]} />;

export default App;
