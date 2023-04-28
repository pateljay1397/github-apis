/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React from "react";
import { SvgStatusErrorHollow, SvgStatusSuccessHollow } from "@itwin/itwinui-icons-react";
import { ProgressLinear, ProgressRadial } from "@itwin/itwinui-react";
import { ITwinLayout } from "./itwinui-demo/Layout";

// Demonstrates iTwinUI react components
// For more information please visit official repository in Github:
// https://github.com/iTwin/iTwinUI-react

const progressBar = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/progressindicators-progresslinear--determinate-animated",
  component: () =>
    <ProgressLinear style={{ width: "100%" }} isAnimated value={50} />,
};

const progressBarIndeterminate = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/progressindicators-progresslinear--indeterminate",
  component: () =>
    <ProgressLinear style={{ width: "100%" }} isAnimated indeterminate />,
};

const labeledCenterProgressBar = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/progressindicators-progresslinear--labeled-center",
  component: () =>
    <ProgressLinear
      style={{ width: "100%" }}
      labels={[
        "Centered Label",
      ]}
      value={50}
    />,
};

const labeledProgressBar = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/progressindicators-progresslinear--labeled-left-right",
  component: () =>
    <ProgressLinear

      style={{ width: "100%" }}
      labels={[
        "Loading...",
        "50%",
      ]}
      value={50}
    />,
};

const negativeProgressBar = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/progressindicators-progresslinear--negative",
  component: () =>
    <ProgressLinear
      style={{ width: "100%" }}
      labels={[
        "Upload failed",
        <SvgStatusErrorHollow key={""} />,
      ]}
      status="negative"
      value={45}
    />,
};

const positiveProgressBar = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/progressindicators-progresslinear--positive",
  component: () =>
    <ProgressLinear
      style={{ width: "100%" }}
      labels={[
        "Upload done!",
        <SvgStatusSuccessHollow key={""} />,
      ]}
      status="positive"
      value={100}
    />,
};

const radial = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/progressindicators-progressradial--determinate",
  component: () =>
    <ProgressRadial value={50} />,
};

const indeterminateRadial = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/progressindicators-progressradial--indeterminate",
  component: () =>
    <ProgressRadial indeterminate value={50} />,
};

const positiveRadial = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/progressindicators-progressradial--positive",
  component: () =>
    <ProgressRadial status={"positive"} value={100} />,
};

const negativeRadial = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/progressindicators-progressradial--negative",
  component: () =>
    <ProgressRadial status={"positive"} value={100} />,
};

const radialWithContent = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/progressindicators-progressradial--determinate-with-content",
  component: () =>
    <ProgressRadial value={50}>50</ProgressRadial>,
};

const App = () => <ITwinLayout
  headline="Different styles of loading indicators to be used in iTwin.js applications"
  components={[
    { title: "Animated Determinate Progress Bar", component: progressBar },
    { title: "Animated Indeterminate Progress Bar", component: progressBarIndeterminate },
    { title: "Progress Bar with Label at Center", component: labeledCenterProgressBar },
    { title: "Progress Bar with Label", component: labeledProgressBar },
    { title: "Negative Progress Bar", component: negativeProgressBar },
    { title: "Positive Progress Bar", component: positiveProgressBar },
    { title: "Determinate Radial Progress Indicator", component: radial },
    { title: "Indeterminate Radial Progress Indicator", component: indeterminateRadial },
    { title: "Positive Radial Progress Indicator", component: positiveRadial },
    { title: "Negative Radial Progress Indicator", component: negativeRadial },
    { title: "Radial Progress Indicator with Content", component: radialWithContent },
  ]} />;

export default App;
