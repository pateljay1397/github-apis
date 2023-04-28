# Grouping Mapping Widget sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates the [Grouping & Mapping Widget](https://www.npmjs.com/package/@itwin/grouping-mapping-widget) from @itwin/grouping-mapping-widget npm package.

## Purpose

- Provide [code examples](./LazyLoadingInMemoryMappingClient.ts) for using Grouping & Mapping Widget with in-memory database.

## Description

This sample is of Grouping & Mapping Widget which uses in-memory database for storing Mapping configuration.
LazyLoadedInMemoryDB is used to load and import iModel Mappings in local memory and make changes (creating, modifying, deleting) to mappings, groups, properties and custom calculations without committing them and without having associated permissions. Documentation for Mappings can be found [here](https://developer.bentley.com/apis/insights/overview/).

## Typical Workflow

* Create an empty iModel Mapping. Each mapping represents a collection of 'Groups'.
* Create one or more Groups under that Mapping. A Group is a collection of iModel elements and their properties of interest.
* Create one or more Group Properties for each Group.
* Create one or more Calculated Properties for each group.
* Create one or more Custom Calculations for each group.
