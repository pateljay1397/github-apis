/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React from "react";
import { Badge } from "@itwin/itwinui-react";
import { ITwinLayout } from "./itwinui-demo/Layout";

// Demonstrates iTwinUI react components
// For more information please visit official repository in Github:
// https://github.com/iTwin/iTwinUI-react

const badgeBasic = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/core-badge--basic",
  component: () =>
    <Badge>Basic Badge</Badge>,
};

const badgeLong = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/core-badge--long-label",
  component: () =>
    <Badge>Long label that gets truncated</Badge>,
};

const badgeSuccess = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/core-badge--statuses",
  component: () =>
    <Badge backgroundColor="positive">Success</Badge>,
};

const badgeError = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/core-badge--statuses",
  component: () =>
    <Badge backgroundColor="negative">Error</Badge>,
};

const badgeInfo = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/core-badge--statuses",
  component: () =>
    <Badge backgroundColor="primary">Informational</Badge>,
};

const badgeWarning = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/core-badge--statuses",
  component: () =>
    <Badge backgroundColor="warning">Warning</Badge>,
};

const App = () => <ITwinLayout
  headline="Different styles of badges to be used in iTwin.js applications"
  components={[
    { title: "Basic Badge", component: badgeBasic},
    { title: "Long Label Badge", component: badgeLong},
    { title: "Success Badge", component: badgeSuccess},
    { title: "Error Badge", component: badgeError},
    { title: "Informational Badge", component: badgeInfo},
    { title: "Warning Badge", component: badgeWarning},
  ]} />;

export default App;
