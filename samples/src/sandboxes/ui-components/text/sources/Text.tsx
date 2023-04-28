/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React from "react";
import { Anchor, Blockquote, Body, Code, Headline, Input, Label, Leading, Small, Subheading, Text, Title } from "@itwin/itwinui-react";
import { ITwinLayout } from "./itwinui-demo/Layout";

// Demonstrates iTwinUI react components
// For more information please visit official repository in Github:
// https://github.com/iTwin/iTwinUI-react

const bodyText = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/typography-body--basic",
  component: () =>
    <Body>This is Body Text</Body>,
};

const bodyTextMuted = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/typography-body--muted",
  component: () =>
    <Body isMuted>This is Muted Body Text</Body>,
};

const skeletonText = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/typography-body--skeleton",
  component: () =>
    <Body isSkeleton>This is a skeleton</Body>,
};

const anchor = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/typography-anchor--basic",
  component: () =>
    <Anchor href="https://www.itwinjs.org/">https://www.itwinjs.org</Anchor>,
};

const blockquote = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/typography-blockquote--basic",
  component: () =>
    <Blockquote>This is a quote</Blockquote>,
};

const blockquoteWithFooter = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/typography-blockquote--with-footer",
  component: () =>
    <Blockquote footer="Greg Bentley, Nasdaq Listed">
      For 36 years we have served engineers with our software,
      passionately believing that better performing and more resilient infrastructure is
      essential to improve the quality of life for people everywhere,
      sustain our environment, and grow our economies.
    </Blockquote>,
};

const code = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/typography-code--basic",
  component: () =>
    <Body>
      The <Code>push()</Code> method adds one or more elements to the end of
      an array and returns the new length of the array.
    </Body>,
};

const headline = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/typography-headline--base",
  component: () =>
    <Headline>I'm a Headline</Headline>,
};

const title = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/typography-title--base",
  component: () =>
    <Title>I'm a Title</Title>,
};

const subheading = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/typography-subheading--base",
  component: () =>
    <Subheading>I'm a Subheading</Subheading>,
};

const leadingText = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/typography-leading--base",
  component: () =>
    <Leading>I'm a Leading text</Leading>,
};

const plainText = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/typography-text--basic",
  component: () =>
    <Text>I'm a Plain text</Text>,
};

const smallText = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/typography-small--base",
  component: () =>
    <Small>I'm a Small text</Small>,
};

const label = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/typography-label--basic",
  component: () =>
    <>
      <Label htmlFor="text-input">
        Name
      </Label>
      <Input id="text-input" placeholder="Enter name" />
    </>,
};

const labelInline = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/typography-label--inline",
  component: () =>
    <div style={{ display: "flex" }}>
      <Label htmlFor="text-input" displayStyle="inline" required>
        Name
      </Label>
      <Input id="text-input" defaultValue="James Bond" required />
    </div>,
};

const App = () => <ITwinLayout
  headline="Different text styles to be used in iTwin.js applications"
  components={[
    { title: "Body Text", component: bodyText },
    { title: "Body Text Muted", component: bodyTextMuted },
    { title: "Skeleton Text", component: skeletonText },
    { title: "Anchor", component: anchor },
    { title: "Blockquote", component: blockquote },
    { title: "Blockquote with Footer", component: blockquoteWithFooter },
    { title: "Inline Code style", component: code },
    { title: "Headline", component: headline },
    { title: "Title", component: title },
    { title: "Subheading", component: subheading },
    { title: "Leading Text", component: leadingText },
    { title: "Plain Text", component: plainText },
    { title: "Small Text", component: smallText },
    { title: "Label", component: label },
    { title: "Inline Label", component: labelInline },
  ]} />;

export default App;
