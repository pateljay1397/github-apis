/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React from "react";
import { SvgAdd, SvgDelete, SvgEdit, SvgPlaceholder, SvgUndo } from "@itwin/itwinui-icons-react";
import { Button, ButtonGroup, DropdownButton, IconButton, MenuItem, Select, SplitButton, ToggleSwitch } from "@itwin/itwinui-react";
import { Demo, ITwinLayout } from "./itwinui-demo/Layout";

// Demonstrates iTwinUI react components
// For more information please visit official repository in Github:
// https://github.com/iTwin/iTwinUI-react

const defaultButton: Demo = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/buttons-button--default",
  component: (args) =>
    <Button {...args}>Default Button</Button>,
};

const highVisibilityButton: Demo = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/buttons-button--high-visibility",
  component: (args) =>
    <Button styleType="high-visibility" {...args}>High Visibility Button</Button>,
};

const ctaButton: Demo = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/buttons-button--call-to-action",
  component: (args) =>
    <Button as="button" styleType="cta" {...args}>Call to Action Button</Button>,
};

const buttonWithIcon: Demo = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/buttons-button--with-icon",
  component: (args) =>
    <Button startIcon={<SvgAdd />} styleType="high-visibility" {...args}>New</Button>,
};

const linkButton: Demo = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/buttons-button--as-link",
  component: (args) =>
    <Button
      as="a"
      href="https://www.itwinjs.org"
      target="_blank"
      startIcon={
        <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="m16 0v5.4l-1.9-2-8.4 8.4-1.5-1.5 8.3-8.4-1.9-1.9m5.4 16v-9h-1v8h-14v-14h8v-1h-9v16z" />
        </svg>
      }
      {...args}>
      Open in new tab
    </Button>,
};

const groupedButtons: Demo = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/buttons-buttongroup--with-icons",
  component: (args) =>
    <ButtonGroup>
      <IconButton onClick={() => alert("Clicked add!")} {...args}>
        <SvgAdd />
      </IconButton>
      <IconButton onClick={() => alert("Clicked edit!")} isActive {...args}>
        <SvgEdit />
      </IconButton>
      <IconButton disabled onClick={() => alert("Clicked delete!")} {...args}>
        <SvgDelete />
      </IconButton>
      <IconButton onClick={() => alert("Clicked undo!")} {...args}>
        <SvgUndo />
      </IconButton>
    </ButtonGroup>,
};

const dropDownButton: Demo = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/buttons-dropdownbutton--basic",
  component: (args) => {
    const buttonMenuItems = () => [
      <MenuItem key={1}>
        Item #1
      </MenuItem>,
      <MenuItem key={2}>
        Item #2
      </MenuItem>,
      <MenuItem key={3}>
        Item #3
      </MenuItem>,
    ];

    return (
      <DropdownButton menuItems={buttonMenuItems} {...args}>Dropdown Button</DropdownButton>
    );
  },
};

const buttonWithIconOnly: Demo = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/buttons-iconbutton--add",
  component: (args) =>
    <IconButton {...args}>
      <SvgAdd />
    </IconButton>,
};

const splitButton: Demo = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/buttons-splitbutton--basic",
  component: (args) => {
    const buttonMenuItems = () => [
      <MenuItem key={1} icon={<SvgPlaceholder />} >
        Item #1
      </MenuItem>,
      <MenuItem key={2} icon={<SvgPlaceholder />} >
        Item #2
      </MenuItem>,
      <MenuItem key={3} icon={<SvgPlaceholder />}>
        Item #3
      </MenuItem>,
    ];

    return (
      <SplitButton menuItems={buttonMenuItems} styleType="default" startIcon={<SvgEdit />} {...args}>
        Split Button
      </SplitButton>
    );
  },
};

const splitButtonBorderless: Demo = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/buttons-splitbutton--basic",
  component: (args) => {
    const buttonMenuItems = () => [
      <MenuItem key={1} icon={<SvgPlaceholder />} >
        Item #1
      </MenuItem>,
      <MenuItem key={2} icon={<SvgPlaceholder />} >
        Item #2
      </MenuItem>,
      <MenuItem key={3} icon={<SvgPlaceholder />}>
        Item #3
      </MenuItem>,
    ];

    return (
      <SplitButton menuItems={buttonMenuItems} styleType="borderless" startIcon={<SvgEdit />} {...args}>
        Split Button
      </SplitButton>
    );
  },
};

const demoControls = (size: string, onSize: (value: string) => void, disabled: boolean, onDisabled: (value: boolean) => void) =>
  <>
    <ToggleSwitch
      label="Show as disabled"
      onChange={() => onDisabled(!disabled)}
      checked={disabled}
    />
    <Select
      size="small"
      value={size}
      options={[{ label: "Small size", value: "small" }, { label: "Default size", value: "default" }, { label: "Large size", value: "large" }]}
      onChange={onSize} />
  </>;

const App = () => <ITwinLayout
  headline="Different styles of buttons to be used in iTwin.js applications"
  controls={demoControls}
  components={[
    { title: "Default Button", component: defaultButton, info: "Button for general use" },
    { title: "High Visibility Button", component: highVisibilityButton, info: "Button to get attention" },
    { title: "Call to Action Button", component: ctaButton, info: "Button to prompt user input" },
    { title: "Button with Icon", component: buttonWithIcon, info: "Button that displays an icon" },
    { title: "Button as Link", component: linkButton, info: "Button that acts as a link" },
    { title: "Button Groups", component: groupedButtons, info: "A group of buttons forming a task bar" },
    { title: "Dropdown Button", component: dropDownButton, info: "A button with dropdown menu" },
    { title: "Button with Icon Only", component: buttonWithIconOnly, info: "A button with graphical icon only" },
    { title: "Split Button", component: splitButton, info: "A split button combined with dropdown menu" },
    { title: "Split Button without Border", component: splitButtonBorderless, info: "A split button combined with dropdown menu" },
  ]} />;

export default App;

