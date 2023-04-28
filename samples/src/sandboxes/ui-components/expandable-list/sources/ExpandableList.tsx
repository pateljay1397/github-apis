/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useState } from "react";
import { ExpandableBlock, Select } from "@itwin/itwinui-react";
import { Demo, ITwinLayout } from "./itwinui-demo/Layout";

// Demonstrates iTwinUI react components
// For more information please visit official repository in Github:
// https://github.com/iTwin/iTwinUI-react

const basicExpandableBlock: Demo = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/core-expandableblock--basic",
  component: ({ size }) =>
    <ExpandableBlock title="Basic Block" size={size as BlockSize}>
      Content in block!
    </ExpandableBlock>,
};

const statusBlock: Demo = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/core-expandableblock--status-icon",
  component: ({ size }) =>
    <ExpandableBlock status="positive" title="Status Block" size={size as BlockSize}>
      Content in block!
    </ExpandableBlock>,
};

const captionBlock: Demo = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/core-expandableblock--with-caption",
  component: ({ size }) =>
    <ExpandableBlock caption="Block Caption" title="Caption Block" size={size as BlockSize}>
      Content in block!
    </ExpandableBlock>,
};

const accordionBlock: Demo = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/core-expandableblock--accordion",
  component: ({ size }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [openedBlock, setOpenedBlock] = useState<number | undefined>(undefined);
    const toggleHandler = (isExpanding: boolean, id: number) => {
      isExpanding ? setOpenedBlock(id) : setOpenedBlock(undefined);
    };

    return (
      <>
        {[...Array(3).fill(null)].map((_, index) => (
          <ExpandableBlock
            key={index}
            title={`Basic Block #${index + 1}`}
            isExpanded={openedBlock === index}
            onToggle={(isExpanding) => toggleHandler(isExpanding, index)}
            size={size as BlockSize}
          >
            Content in block!
          </ExpandableBlock>
        ))}
      </>
    );
  },
};

const demoControls = (size: string, onSize: (value: string) => void) => <>
  <Select
    size="small"
    value={size}
    options={[{ label: "Small size", value: "small" }, { label: "Default size", value: "default" }]}
    onChange={onSize} />
</>;

type BlockSize = "small" | "default";

const App = () => <ITwinLayout
  headline="Different styles of expandable lists to be used in iTwin.js applications"
  controls={demoControls}
  components={[
    { title: "Basic Expandable Block", component: basicExpandableBlock },
    { title: "Expandable Block with Status Icon", component: statusBlock },
    { title: "Expandable Block with Caption", component: captionBlock },
    { title: "Expandable Block as Accordion", component: accordionBlock },
  ]} />;

export default App;
