# Background Colors Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This samples demonstrate how to add a background image to the viewport, and add a color on-top with transparency, as well as a 2 and 4 color gradient

## Purpose

The purpose of this sample is to demonstrate the following:

- How to apply background color options in iTwin viewport:
  - Single color, with and without transparency
  - Two color gradient SkyBox
  - Four color gradient SkyBox

## Description

To set a background style, call `viewport.overrideDisplayStyle` and hand it the [DisplayStyleSettingsProps](https://www.itwinjs.org/reference/core-common/displaystyles/displaystylesettingsprops/). In this sample, [`DisplayStyle3DSettingsProps](https://www.itwinjs.org/reference/core-common/displaystyles/displaystyle3dsettingsprops/) are used to provided more options. It is also suggested to save and load the styles in json format.

Change the background colors with a color picker or pre-set gradients.

We invite you to create your own gradients in [BackgroundColorsPresets.tsx](./BackgroundColorsPresets.tsx).
