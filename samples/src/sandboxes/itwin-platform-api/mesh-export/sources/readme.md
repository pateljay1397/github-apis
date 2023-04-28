# Mesh Export Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates calling [Mesh Export APIs](https://developer.bentley.com/apis/mesh-export/) to create GLTF files from iModel elements.

## Purpose

- Demonstrate how to find the iModel id, changeset id, viewed models and viewed categories for a viewport.
- Provide [code examples](./MeshExportClient.ts) for calling the Mesh Export APIs.
- Show how to check the status of an export and download the resulting files once it's complete.

## Description

This bare bones sample is intended to show the most basic workflow for creating GLTF files from iModels.

You can view your exported files by dropping the extracted .gltf and .bin onto this [glTF Viewer](https://gltf-viewer.donmccurdy.com/).

Read more about glTF at the [official Khronos glTF repository](https://github.com/KhronosGroup/glTF).

Note that the `mesh-export:modify` and `mesh-export:read` scopes are required for the workflow shown here.
