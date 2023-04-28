# Validation Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates using the [Property Validation client library](https://www.npmjs.com/package/@itwin/property-validation-client) to retrieve validation results and visualize the elements containing rule violations.

## Purpose

- Provide code examples for calling the property validation client library.
- Plot the location of elements that violate validation rules using marker pins.
- Populate table of violations with violating element and rule information.
- Visualize elements not passing validation by emphasizing them and coloring them red.
- Zoom to violating element on marker click or table selection.

## Description

The goal of this sample is to provide code examples for all of the available property validation client [functions](./ValidationClient.ts). There are five components of property validation: templates, rules, tests, runs and results.

- [Templates](https://github.com/iTwin/property-validation-client/blob/main/src/base/interfaces/apiEntities/TemplateInterfaces.ts#L7) define validation functions and parameters.
- [Rules](https://github.com/iTwin/property-validation-client/blob/main/src/base/interfaces/apiEntities/RuleInterfaces.ts#L35) contain property validation criteria and the ID of a template.
- [Tests](https://github.com/iTwin/property-validation-client/blob/main/src/base/interfaces/apiEntities/TestInterfaces.ts#L40) contain metadata and the IDs of one or more rules.
- [Runs](https://github.com/iTwin/property-validation-client/blob/main/src/base/interfaces/apiEntities/RunInterfaces.ts#L25) contain metadata and the ID of the result.
- [Results](https://github.com/iTwin/property-validation-client/blob/main/src/base/interfaces/apiEntities/ResultInterfaces.ts#L26) contain the ID and label of elements, rule ID, and property value.

The following [iTwin.js library](https://www.itwinjs.org/reference/) components are demonstrated:

- [Decorator](https://www.itwinjs.org/reference/core-frontend/views/decorator/): show marker pins in a viewport.
- [MarkerSet](https://www.itwinjs.org/reference/core-frontend/views/markerset/): manage a collection of marker pins.
- [Marker](https://www.itwinjs.org/reference/core-frontend/views/marker/): draw marker pins at the location of violating elements.
- [Cluster](https://www.itwinjs.org/reference/core-frontend/views/cluster/): draw cluster pins where a group of violations are located.
- [Table](https://www.itwinjs.org/reference/components-react/table/): display a table of validation results.
