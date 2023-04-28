# Viewer Only Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This is the simplest iTwin.js frontend sample.  It displays a viewport and shows a view navigation toolbar.

## Purpose

The main purpose is to illustrate the structure we use for samples.  Specifically:

* The file [ViewportOnlyApp](./ViewportOnlyApp.tsx) has the definition for the UI specific to this sample.
* Samples typically also have a {SampleName}Widget.tsx which implements the UI specific to its sample.
* Samples typically also have a {SampleName}Api.tsx which includes the sample's key logic and API calls.

## Description

Besides this very basic first sample, there are dozens of others available.  For example, samples are provided to demonstrate:

* How to display [reality data](../reality-data-sample/readme.md) and [2D models](../viewer-only-2d-sample/readme.md)
* How to change the [view attributes](../view-attributes-sample/readme.md) to control things like render mode, background map, and sky box.
* Using decorators to draw your own graphics such as a [heatmap](../heatmap-decorator-sample/readme.md) or location [markers](../marker-pin-sample/readme.md).
* Querying imodel elements based on [volume](../volume-query-sample/readme.md) criteria.
* Using the @bentley/components-react library to create components like [buttons](../button-sample/readme.md), [sliders](../slider-sample/readme.md), and [trees](../basic-tree-sample/readme.md).

... and more!
