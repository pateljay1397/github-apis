# Reporting Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates calling [Reporting APIs](https://developer.bentley.com/apis/insights/operations/odata/) to request and visualize the data in an insights report of iModel.

If you want to configure an insights report for an iModel by yourself, visit this [tutorial](https://developer.bentley.com/tutorials/creating-an-insights-report-using-imodel-data/) to get more information.

## Purpose

- Provide [code examples](./ReportingClient.ts) for calling the Reporting API.
- Colorize properties based on the report data.

## Description

The Reporting API returns an object of [Report](https://developer.bentley.com/apis/insights/#reports) with insights data including elements partitioned by groups and property columns for each element.  This information is passed to a [FeatureOverrideProvider](https://www.itwinjs.org/reference/imodeljs-frontend/views/featureoverrideprovider/) that colorizes the grouped elements based on the operations.

NOTE: There are prerequisites to use the Reporting APIs.  The user requires a particular role in the project, the client scope must include 'insights:read' and 'iModels:read', and Insights and Reporting `View` permission must be enabled on the project level.  Please see the [API documentation site](https://developer.bentley.com/apis/insights/operations/odata/) for more details on the prerequisites and usage.
