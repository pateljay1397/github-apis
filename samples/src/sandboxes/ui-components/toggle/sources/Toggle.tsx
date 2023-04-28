/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React from "react";
import { SvgCheckmark } from "@itwin/itwinui-icons-react";
import { ToggleSwitch } from "@itwin/itwinui-react";
import { ITwinLayout } from "./itwinui-demo/Layout";

// Demonstrates iTwinUI react components
// For more information please visit official repository in Github:
// https://github.com/iTwin/iTwinUI-react

const toggleSwitch = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/input-toggleswitch--basic",
  component: () =>
    <ToggleSwitch defaultChecked />,
};

const disabledToggleSwitch = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/input-toggleswitch--disabled-checked",
  component: () =>
    <ToggleSwitch defaultChecked disabled />,
};

const toggleSwitchLabelRight = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/input-toggleswitch--label-right",
  component: () =>
    <ToggleSwitch defaultChecked label="This is a right label" labelPosition="right" />,
};

const toggleSwitchLabelLeft = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/input-toggleswitch--label-left",
  component: () =>
    <ToggleSwitch defaultChecked label="This is a left label" labelPosition="left" />,
};

const toggleSwitchIcon = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/input-toggleswitch--with-icon",
  component: () =>
    <ToggleSwitch defaultChecked icon={<SvgCheckmark />} />,
};

const App = () => <ITwinLayout
  headline="Different styles of toggles to be used in iTwin.js applications"
  components={[
    { title: "Default ToggleSwitch", component: toggleSwitch },
    { title: "Disabled ToggleSwitch", component: disabledToggleSwitch },
    { title: "ToggleSwitch with Label on the Right", component: toggleSwitchLabelRight },
    { title: "ToggleSwitch with Label on the Left", component: toggleSwitchLabelLeft },
    { title: "ToggleSwitch with Icon", component: toggleSwitchIcon },
  ]} />;

export default App;

