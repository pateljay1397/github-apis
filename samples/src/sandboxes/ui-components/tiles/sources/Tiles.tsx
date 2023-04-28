/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React from "react";
import { SvgFolder, SvgImodelHollow, SvgTag } from "@itwin/itwinui-icons-react";
import { Badge, MenuItem, Tag, TagContainer, Tile, UserIcon } from "@itwin/itwinui-react";
import { ITwinLayout } from "./itwinui-demo/Layout";

// Demonstrates iTwinUI react components
// For more information please visit official repository in Github:
// https://github.com/iTwin/iTwinUI-react

const basicTile = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/core-tile--basic",
  component: () =>
    <Tile
      badge={<Badge backgroundColor="hsl(197, 71%, 83%)">Badge</Badge>}
      description="National stadium in Singapore. Features landscape details and a metro station. This is the largest sample iModel."
      metadata={
        <>
          <SvgTag />
          <TagContainer>
            <Tag variant="basic">tag 1</Tag>
            <Tag variant="basic">tag 2</Tag>
          </TagContainer>
        </>}
      moreOptions={[
        <MenuItem key="1">Item 1</MenuItem>,
        <MenuItem key="2">Item 2</MenuItem>,
      ]}
      name="Stadium"
      thumbnail="https://itwinplatformcdn.azureedge.net/iTwinUI/stadium.png"
      variant="default"
    />,
};

const folderTile = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/core-tile--folder",
  component: () =>
    <Tile
      description="Folder description"
      metadata={<span>Folder metadata</span>}
      moreOptions={[
        <MenuItem key="1">Item 1</MenuItem>,
        <MenuItem key="2">Item 2</MenuItem>,
      ]}
      name="Folder name"
      thumbnail={<SvgFolder />}
      variant="folder"
    />,
};

const userIconTile = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/core-tile--with-user-icon",
  component: () =>
    <Tile
      badge={<Badge backgroundColor="hsl(197, 71%, 83%)">Badge</Badge>}
      description="User description"
      moreOptions={[
        <MenuItem key="1">Item 1</MenuItem>,
        <MenuItem key="2">Item 2</MenuItem>,
      ]}
      name="Some User"
      thumbnail={
        <UserIcon
          abbreviation="TR"
          backgroundColor="#6AB9EC"
          image={<img src="https://itwinplatformcdn.azureedge.net/iTwinUI/user-placeholder.png" alt="placeholder" />}
          size="large"
          status="online"
          title="Terry Rivers"
        />}
      variant="default"
    />,
};

const condensedTile = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/core-tile--condensed",
  component: () =>
    <Tile
      moreOptions={[
        <MenuItem key="1">Item 1</MenuItem>,
        <MenuItem key="2">Item 2</MenuItem>,
      ]}
      name="Condensed"
      thumbnail={<SvgImodelHollow />}
      variant="default"
    />,
};

const App = () => <ITwinLayout
  headline="Different styles of tiles to be used in iTwin.js applications"
  components={[
    { title: "Basic Tile", component: basicTile },
    { title: "Folder Tile", component: folderTile },
    { title: "User Icon Tile", component: userIconTile },
    { title: "Condensed Tile", component: condensedTile },
  ]} />;

export default App;
