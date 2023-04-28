/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React from "react";
import { SvgSearch } from "@itwin/itwinui-icons-react";
import { LabeledInput, Tooltip } from "@itwin/itwinui-react";
import { ITwinLayout } from "./itwinui-demo/Layout";

// Demonstrates iTwinUI react components
// For more information please visit official repository in Github:
// https://github.com/iTwin/iTwinUI-react

const searchInput = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/input-labeledinput--hybrid-layout",
  component: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const ref = React.useRef(null);
    return (
      <>
        <LabeledInput
          placeholder="Search..."
          svgIcon={
            <div ref={ref}>
              <SvgSearch />
            </div>
          }
          iconDisplayStyle="inline"
          onChange={(event) => console.log(`Search text: ${event.target.value}`)} />
        <Tooltip reference={ref} content="Searching site contents" />
      </>
    );
  },
};

const App = () => <ITwinLayout
  headline="Different styles of search boxes to be used in iTwin.js applications"
  components={[
    { title: "Search box", component: searchInput },

  ]} />;

export default App;
