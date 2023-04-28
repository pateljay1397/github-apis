# Saved Views Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates calling [Saved Views APIs](https://developer.bentley.com/apis/savedviews/) to retrieve saved views for review in a viewer app.

## Purpose

- Populate tiles of saved views thumbnail with tags, categories grouped by group name.
- Apply saved view to the viewer.
- Provide [code examples](./SavedViewsApi.ts) for calling the Saved Views APIs.
- Provide [code examples](./SavedViewItwinJsViewStateParser.ts) for transforming ViewState to Saved view and vice versa.

## Description

Saved views is a feature in iTwin Platform that enable applications to maintain display information on how to visualize an iTwin. An API now provides direct access to this functionality to enable 3rd-party app integration.

The goal of this sample is to provide example functions for all of the available Saved Views APIs. In fact, two of the example functions are called to populate the saved views tile and apply saved view to the viewer. [Saved Views result sample data](./SavedViewsJsonData.ts) is also provided to show the format of the data returned from the API.

The following [iTwinUI-react library](https://itwin.github.io/iTwinUI-react/?path=/story/overview--overview) components are demonstrated:

- [Tile](https://itwin.github.io/iTwinUI-react/?path=/story/core-tile--all-props): display the saved views results.
- [TagContainer](https://itwin.github.io/iTwinUI-react/?path=/docs/core-tagcontainer--basic-tags-container): placeholder to group saved views tags together.
- [Tag](https://itwin.github.io/iTwinUI-react/?path=/docs/core-tag--default): display the saved views tags.
