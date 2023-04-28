# Road Network Decoration

Copyright © Bentley Systems, Incorporated, © OpenStreetMap contributors. All rights reserved.

This sample shows how to create a particle effect using OpenStreetMaps to populate a network of roads and streets with moving cars.

## Copyright Disclaimer

This sample uses the [Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API) distributed and created by [OpenStreetMap](https://www.openstreetmap.org/). The data retrieved from this API is made available under the Open Database License.

For more information about OSM and licensing, see their [licensing page](https://www.openstreetmap.org/copyright).

Map tiles are also pulled from OpenStreetMap. Find more information about OSM map tiles [here](https://wiki.openstreetmap.org/wiki/Tiles).

## Purpose

The purpose of this sample is to demonstrate the following:

* Working with external APIs and using them to build a road network
* Displaying this network using a decorator
* Using the viewport extents to vary the level of detail displayed by the decorator

## Description

In this sample, a decorator is used to display a complex road network created from OpenStreetMap data. This road network is generated using two methods from the [OverpassApi](./open-street-map/OverpassApi.ts) class. The first method requests OSM street data within the bounds of the viewport and constructs streets and intersections. The second rebuilds and filters the existing network given a driving direction and highway tags. Note: there should only be one instance of OverpassApi data in the app.

This road network is displayed using the [Decorator](https://www.itwinjs.org/reference/core-frontend/views/decorator/), [ParticleCollectionBuilder](https://www.itwinjs.org/reference/core-frontend/rendering/particlecollectionbuilder/), and [GraphicBuilder](https://www.itwinjs.org/reference/core-frontend/rendering/graphicbuilder/) interfaces. The GraphicBuilder produces [RenderGraphics](https://www.itwinjs.org/reference/core-frontend/rendering/rendergraphic/) for the road lanes, while the ParticleCollectionBuilder produces RenderGraphics for points along the street. These are added to the [DecorateContext](https://www.itwinjs.org/reference/core-frontend/rendering/decoratecontext) in the decorator's `decorate` method.

To help with memory management, particle textures are owned by the decorator, which contains a `dispose()` method that needs to be called before a decorator is destroyed.

The `createDecorator` method in [RoadDecorationApi.ts]("./RoadDecorationApi.ts") is responsible for disposing the existing decorator and creating a new decorator. It passes the new decorator to the [ViewManager.addDecorator](https://www.itwinjs.org/reference/core-frontend/views/viewmanager/adddecorator/) method to have it rendered in all active views. Note that this method updates `RoadDecorationApi.dispose()` to be tied to the new decorator.

This sample also demonstrates a way to show different levels of detail depending on the zoom of the viewport. To do this, a listener is added to [viewport.onViewChanged](https://www.itwinjs.org/reference/core-frontend/views/viewport/onviewchanged/) to keep track of the viewport's extents. The available filters are updated based on these extents. When clicking `Update Street Data`, the request to OpenStreetMap is limited to the available filters. So when zoomed farther out, fewer types of streets are searched for. This helps with performance as well as limiting the size of the requested data from OSM.

Because the location, line width, and color of the street network do not need to change, the actual graphic drawn by the decorator can be created and cached when the decorator is created instead of on every render to help performance. The graphic itself is created in `initialize` but added to the decorator context in `decorate`.

## Additional Resources

For more examples of decorators, see these samples:

* [Heatmap Decorator Sample](../Heatmap%20Decorator/readme.md)
* [Particle Effect (Snow & Rain)](../Snow%20and%20Rain%20Particle%20Effect/readme.md)
* [Fire Particle Effect](../Fire%20Particle%20Effect/readme.md)
* [Car Particle Effect](../Car%20Particle%20Effect/readme.md)

## Notes

* Updating street data re-queries OSM with the current extents of the viewport and create a new decorator with the results.
* When in `streets only` mode, the background map is set to the OpenStreetMap street view map, otherwise it's set to Bing's hybrid map.
