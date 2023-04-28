# iModels OData Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates calling [iModels OData APIs](https://developer.bentley.com/apis/imodels-odata/) to request and visualize the data in an iModel using OData interface.

## Purpose

- Provide [code examples](./MappingOData.tsx) for integrating OData feed into `ItwinViewerUi`.
- Colorize properties based on the report data.

## Mapping Data View

`Mapping OData` tab shows iModel contents using the views created in a [Mapping](https://developer.bentley.com/apis/insights/operations/create-mapping/).

NOTE: This is a direct query of an iModel, [Report](https://developer.bentley.com/apis/insights/operations/create-report/) and [Extraction](https://developer.bentley.com/apis/insights/operations/run-extraction/) is not used.

## Description

All [Entities](https://developer.bentley.com/apis/imodels-odata/operations/mapping-odata-entity/) contain element information including `ECInstanceId`. This information is passed to a [FeatureOverrideProvider](https://www.itwinjs.org/reference/imodeljs-frontend/views/featureoverrideprovider/) that colorizes the grouped elements based on the operations.

NOTE: There are prerequisites to use the Models OData APIs. The user requires a particular role in the project, the client scope must include `insights:read` and `imodels:read`, and iModelHub `View` permission must be enabled on the project level. Please see the [API documentation site](https://developer.bentley.com/apis/imodels-odata/operations/mapping-odata/) for more details on the prerequisites and usage.
