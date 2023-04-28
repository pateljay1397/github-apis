/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React from "react";
import { SvgCheckmark, SvgHistory, SvgStar } from "@itwin/itwinui-icons-react";
import { HorizontalTabs, Tab, VerticalTabs } from "@itwin/itwinui-react";
import { ITwinLayout } from "./itwinui-demo/Layout";

// Demonstrates iTwinUI react components
// For more information please visit official repository in Github:
// https://github.com/iTwin/iTwinUI-react

/* eslint-disable react-hooks/rules-of-hooks */

const defaultTabs = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/core-tabs--default-tabs",
  component: () => {
    const [index, setIndex] = React.useState(0);
    return (
      <HorizontalTabs
        onTabSelected={setIndex}
        labels={[
          <Tab key={0} label="Item1" />,
          <Tab key={1} label="Item2" />,
          <Tab key={2} label="Item3" />,
        ]}
      >
        {tabContent[index]}
      </HorizontalTabs>
    );
  },
};

const borderlessTabs = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/core-tabs--borderless-tabs",
  component: () => {
    const [index, setIndex] = React.useState(0);
    return (
      <HorizontalTabs
        type="borderless"
        onTabSelected={setIndex}
        labels={[
          <Tab key={0} label="Item1" />,
          <Tab key={1} label="Item2" />,
          <Tab key={2} label="Item3" />,
        ]}
      >
        {tabContent[index]}
      </HorizontalTabs>
    );
  },
};

const pillTabs = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/core-tabs--pill-tabs",
  component: () => {
    const [index, setIndex] = React.useState(0);
    return (
      <HorizontalTabs
        type="borderless"
        onTabSelected={setIndex}
        labels={[
          <Tab key={0} label="Item1" sublabel="Sub Label" startIcon={<SvgStar />} />,
          <Tab key={1} label="Item2" sublabel="Sub Label" startIcon={<SvgHistory />} />,
          <Tab key={2} label="Item3" sublabel="Sub Label" startIcon={<SvgCheckmark />} />,
        ]}
      >
        {tabContent[index]}
      </HorizontalTabs>
    );
  },
};

const verticalTabs = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/core-tabs--vertical",
  component: () => {
    const [index, setIndex] = React.useState(0);
    return (
      <VerticalTabs
        type="borderless"
        onTabSelected={setIndex}
        labels={[
          <Tab key={0} label="Item1" sublabel="Sub Label" startIcon={<SvgStar />} />,
          <Tab key={1} label="Item2" sublabel="Sub Label" startIcon={<SvgHistory />} />,
          <Tab key={2} label="Item3" sublabel="Sub Label" startIcon={<SvgCheckmark />} />,
        ]}
      >
        {tabContent[index]}
      </VerticalTabs>
    );
  },
};

const tabContent = ["Bentley Systems, Incorporated, is an American-based software development company that develops, manufactures, licenses, sells and supports computer software and services for the design, construction, and operation of infrastructure. The company's software serves the building, plant, civil, and geospatial markets in the areas of architecture, engineering, construction (AEC) and operations.",
  "Bentley Systems is headquartered in Exton, Pennsylvania, United States, but has development, sales and other departments in over 50 countries. The company had revenues of $700 million in 2018.",
  "Keith A. Bentley and Barry J. Bentley founded Bentley Systems in 1984. They introduced the commercial version of PseudoStation in 1985, which allowed users of Intergraph VAX systems to use low-cost graphics terminals to view and modify the designs on their Intergraph (Interactive Graphics Design System) installations. Their first product was shown to potential users who were polled as to what they would be willing to pay for it. They averaged the answers, arriving at a price of $7,943. A DOS-based version of MicroStation was introduced in 1986.",
];

const App = () => <ITwinLayout
  headline="Different styles of tabs to be used in iTwin.js applications"
  components={[
    { title: "Horizontal Tabs", component: defaultTabs },
    { title: "Horizontal Borderless Tabs", component: borderlessTabs },
    { title: "Pill Tabs", component: pillTabs },
    { title: "Vertical Tabs", component: verticalTabs },

  ]} />;

export default App;
