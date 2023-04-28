/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React from "react";
import { SvgCamera, SvgCloseSmall } from "@itwin/itwinui-icons-react";
import { IconButton, Input, LabeledInput, LabeledSelect, LabeledTextarea, Radio, Select, Textarea, ToggleSwitch } from "@itwin/itwinui-react";
import { Demo, ITwinLayout } from "./itwinui-demo/Layout";

// Demonstrates iTwinUI react components
// For more information please visit official repository in Github:
// https://github.com/iTwin/iTwinUI-react

const basicInput: Demo = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/input-input--basic",
  component: (args) =>
    <Input placeholder="Basic Input" {...args} />,
};

const inputWithLabel: Demo = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/input-labeledinput--basic",
  component: (args) =>
    <LabeledInput label="This is a label" placeholder="Enter text here..." {...args} />,
};

const inputWithLabelAndMessage: Demo = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/input-labeledinput--with-message",
  component: (args) =>
    <LabeledInput label="This is a label" placeholder="Enter text here..."  {...args} />,
};

const inputWithLabelAndStatus: Demo = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/input-labeledinput--positive",
  component: (args) =>
    <div className="component-group">
      <LabeledInput displayStyle="default" label="This is a label" message="Success" placeholder="Enter text here..." status="positive"  {...args} />
      <LabeledInput displayStyle="default" label="This is a label" message="Warning" placeholder="Enter text here..." status="warning"  {...args} />
      <LabeledInput displayStyle="default" label="This is a label" message="Error" placeholder="Enter text here..." status="negative"  {...args} />
    </div>,
};

const inputWithIcon: Demo = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/input-labeledinput--with-custom-icon",
  component: (args) =>
    <LabeledInput
      label="This is a label"
      svgIcon={<SvgCamera />}
      message="⬅ This is a custom icon"
      placeholder="Enter text here..."
      {...args} />,
};

const labeledInputInline: Demo = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/input-labeledinput--inline",
  component: (args) =>
    <LabeledInput displayStyle="inline" label="This is a label" placeholder="Enter text here..." {...args} />,
};

const labeledInputInlineWithButton: Demo = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/input-labeledinput--hybrid-layout-with-button",
  component: (args) =>
    <LabeledInput
      displayStyle="default"
      iconDisplayStyle="inline"
      label="This is a label"
      message="Block layout with inline borderless button"
      placeholder="Enter text here..."
      svgIcon={<IconButton styleType="borderless"><SvgCloseSmall /></IconButton>}
      {...args} />,
};

const basicSelect: Demo = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/input-select--basic",
  component: (args) =>
    <Select
      placeholder="Placeholder Text"
      options={[
        { label: "Option 1", value: 1 },
        { label: "Option 2", value: 2 },
        { label: "Option 3", value: 3 },
        { label: "Option 4", value: 4 }]}
      {...args}
    />,
};

const basicLabeledSelect: Demo = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/input-labeledselect--basic",
  component: (args) =>
    <LabeledSelect
      label="This is a label"
      placeholder="Placeholder Text"
      message="This is a message"
      options={[
        { label: "Option 1", value: 1 },
        { label: "Option 2", value: 2 },
        { label: "Option 3", value: 3 },
        { label: "Option 4", value: 4 }]}
      {...args}
    />,
};

const labeledSelectStatus: Demo = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/input-labeledselect--positive",
  component: (args) => {
    const options = [{ label: "Option 1", value: 1 }, { label: "Option 2", value: 2 }, { label: "Option 3", value: 3 }];
    return (
      <div className="component-group">
        <LabeledSelect
          label="This is a label"
          placeholder="Placeholder Text"
          message="Success"
          status="positive"
          options={options}
          {...args}
        />
        <LabeledSelect
          label="This is a label"
          placeholder="Placeholder Text"
          message="Warning"
          status="warning"
          options={options}
          {...args}
        />
        <LabeledSelect
          label="This is a label"
          placeholder="Placeholder Text"
          message="Error"
          status="negative"
          options={options}
          {...args}
        />
      </div>
    );
  },
};

const basicTextArea: Demo = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/input-textarea--basic",
  component: ({ disabled }) =>
    <Textarea placeholder="This is a textarea" disabled={disabled} />,
};

const labeledTextArea: Demo = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/input-labeledtextarea--basic",
  component: ({ disabled }) =>
    <LabeledTextarea
      label="Textarea Label"
      message="Display Message"
      placeholder="This is a textarea"
      disabled={disabled}
    />,
};

const labeledTextAreaWithStatus: Demo = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/input-labeledtextarea--positive",
  component: ({ disabled }) =>
    <div className="component-group">
      <LabeledTextarea
        label="Textarea Label"
        message="Success"
        placeholder="This is a textarea"
        status="positive"
        disabled={disabled}
      />
      <LabeledTextarea
        label="Textarea Label"
        message="Warning"
        placeholder="This is a textarea"
        status="warning"
        disabled={disabled}
      />
      <LabeledTextarea
        label="Textarea Label"
        message="Error"
        placeholder="This is a textarea"
        status="negative"
        disabled={disabled}
      />
    </div>,
};

const radioInput: Demo = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/input-radio--basic",
  component: ({ disabled }) =>
    <Radio label="Choose me!" disabled={disabled} />,
};

const radioInputStatus: Demo = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/input-radio--positive",
  component: ({ disabled }) =>
    <div className="component-group">
      <Radio status="positive" label="Positive" disabled={disabled} />
      <Radio status="warning" label="Warning" disabled={disabled} />
      <Radio status="negative" label="Negative" disabled={disabled} />
    </div>,
};

const demoControls = (size: string, onSize: (value: string) => void, disabled: boolean, onDisabled: (value: boolean) => void) => <>
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
  headline="Different styles of inputs to be used in iTwin.js applications"
  controls={demoControls}
  components={[
    { title: "Basic Input", component: basicInput, info: "Input with placeholder" },
    { title: "Labeled Input", component: inputWithLabel, info: "Input with a Label" },
    { title: "Labeled Input with Message", component: inputWithLabelAndMessage, info: "Input with a Label and additional message" },
    { title: "Labeled Input with Status", component: inputWithLabelAndStatus, info: "Input with a Label and status display" },
    { title: "Labeled Input with Custom Icon", component: inputWithIcon, info: "Input with a svgIcon prop" },
    { title: "Labeled Inline Input", component: labeledInputInline, info: "Input with a label inline" },
    { title: "Hybrid Labeled Input with Button", component: labeledInputInlineWithButton, info: "Input with a Label and a Message" },
    { title: "Basic Select", component: basicSelect, info: "A dropdown menu" },
    { title: "Basic Labeled Select", component: basicLabeledSelect, info: "A dropdown menu with a label" },
    { title: "Labeled Select with Status", component: labeledSelectStatus, info: "A dropdown menu that shows a status" },
    { title: "Basic Text Area", component: basicTextArea, info: "A multiline text area" },
    { title: "Basic Text Area with Label", component: labeledTextArea, info: "A multiline text area" },
    { title: "Basic Text Area with Status", component: labeledTextAreaWithStatus, info: "A multiline text area" },
    { title: "Radio", component: radioInput, info: "Radio input" },
    { title: "Radio with Status", component: radioInputStatus, info: "Radio input with status" },
  ]} />;

export default App;
