/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { dispose } from "@itwin/core-bentley";
import {
  Point2d,
  Point3d,
  Transform
} from "@itwin/core-geometry";
import {
  ColorDef,
  RenderTexture,
  TextureTransparency
} from "@itwin/core-common";
import {
  DecorateContext,
  Decorator,
  EventHandled,
  GraphicType,
  HitDetail,
  imageElementFromUrl,
  IModelApp,
  ParticleCollectionBuilder,
  RenderGraphic,
  TextureImage
} from "@itwin/core-frontend";
import { Intersection, Street } from "./common/open-street-map/OverpassApi";
import ReactDOM from "react-dom";
import React from "react";

/** This decorator draws a complex network of roads and streets using a single graphic builder for streets and intersections
 * as well as particle builders for points along streets and intersections
 */
export class RoadDecorator implements Decorator {
  // IDs applied to the graphics to make them hoverable
  private readonly _pickableIdsStreets: Map<string, number> = new Map();
  private readonly _pickableIdsIntersections: Map<string, { intersectionId: number, pathId: number }> = new Map();

  // Texture used by the particle builders for points along streets and intersections
  private _roadPointTexture: RenderTexture | undefined;
  private _intersectionPointTexture: RenderTexture | undefined;

  // Data used to create the graphics
  private _streets: Street[] = [];
  private _intersections: Map<number, Intersection>;

  // Used by the decorate method to determine whether or not to show certain graphics
  private _showIntersections: boolean;
  private _showDebugPoints: boolean;

  // Graphic to be reused by the decorate method - created by `initialize` added to the decoration context in `decorate`
  private _lineGraphic: RenderGraphic | undefined;

  // Method to determine the next pickable id provided in the constructor
  private _getNextPickableId: () => string;

  // This is an override that helps improve performance by caching the decorations
  public readonly useCachedDecorations = true;

  constructor(
    getNextPickableId: () => string,
    showIntersections: boolean,
    showDebugPoints: boolean,
    streets: Street[],
    intersections: Map<number, Intersection>,
    textureUrls: [string, string]
  ) {
    this._getNextPickableId = getNextPickableId;
    this._showIntersections = showIntersections;
    this._showDebugPoints = showDebugPoints;
    this._streets = streets;
    this._intersections = intersections;

    void this.tryTextures(textureUrls);
    this.initialize();
  }

  /** Invoked when this decorator is to be destroyed. */
  public dispose() {
    this._lineGraphic?.dispose();
    dispose(this._roadPointTexture);
    dispose(this._intersectionPointTexture);
  }

  /** Returns true if the id matches the pickable id of this decorator. */
  public testDecorationHit(id: string): boolean {
    return (
      this._pickableIdsStreets.get(id) !== undefined || this._pickableIdsIntersections.get(id) !== undefined
    );
  }

  /** Method override that prevents the graphic from being selectable */
  public async onDecorationButtonEvent(
  ): Promise<EventHandled> {
    return EventHandled.Yes;
  }

  /** Returns an HTMLElement that displays information about the street that is hovered upon */
  public async getDecorationToolTip(
    hit: HitDetail
  ): Promise<HTMLElement | string> {
    const tooltipDiv = document.createElement("div");
    let tooltipBody: JSX.Element = <div>No information found</div>;

    const streetId = this._pickableIdsStreets.get(hit.sourceId);
    const intersectionId = this._pickableIdsIntersections.get(hit.sourceId);

    if (streetId !== undefined) {
      const street = this._streets[streetId];

      // Parsing the tags of the closest street to populate the tooltip
      // For more tags, see https://taginfo.openstreetmap.org/keys/highway#combinations
      const speed = street.tags?.maxspeed;
      const lanes = street.tags?.lanes;
      const reference = street.tags?.ref;
      const tunnel = street.tags?.tunnel === "yes";

      tooltipBody = <div>
        <b>{street.name}<br /></b>
        <span>ID: {street.id}<br /></span>
        <span>Highway type: {street.highway}<br /></span>
        {speed && <span>Speed limit: {speed}<br /></span>}
        {lanes && <span>Lanes: {lanes}<br /></span>}
        {reference && <span>Reference: {reference}<br /></span>}
        {tunnel && <span>Tunnel: {JSON.stringify(tunnel)}<br /></span>}
        {street.isJunction && <span>Junction: {JSON.stringify(street.isJunction)}<br /></span>}
      </div >;

    } else if (intersectionId !== undefined) {
      const intersection = this._intersections.get(intersectionId.intersectionId);
      const path = intersection?.inOutPaths.find((street) => street.id === intersectionId.pathId);

      if (!intersection || !path) return "No path found";

      const streetInto = this._streets[path.inTo];
      const streetOutOf = this._streets[path.outOf];

      tooltipBody = <div>
        <span>Intersection ID: {path.id}<br /></span>
        <span>Into: {streetInto.name}<br /></span>
        <span>Out of: {streetOutOf.name}<br /></span>
      </div >;
    }

    ReactDOM.render(tooltipBody, tooltipDiv);
    return tooltipDiv;
  }

  public showDebugPoints(show: boolean): void {
    this._showDebugPoints = show;
  }

  /** Called by the render loop and adds the graphics to the decorate context. */
  public decorate(context: DecorateContext): void {
    if (!this._roadPointTexture || !this._intersectionPointTexture) return;

    // Creates two particle builders, one will hold street points, the other will hold intersection points
    const roadPointBuilder = ParticleCollectionBuilder.create({
      viewport: context.viewport,
      texture: this._roadPointTexture,
      origin: Point3d.create(0, 0, 2),
      size: Point2d.create(4.6, 2.1),
      transparency: 0,
    });

    const intersectionPointBuilder = ParticleCollectionBuilder.create({
      viewport: context.viewport,
      texture: this._intersectionPointTexture,
      origin: Point3d.create(0, 0, 2),
      size: Point2d.create(4.6, 2.1),
      transparency: 0,
    });

    if (this._showDebugPoints) {
      // Iterate through each street and add a particle for each point along that street
      for (const street of this._streets) {
        for (const p of street.points) {
          roadPointBuilder.addParticle({ size: 2, x: p.x, y: p.y, z: p.z });
        }
      }

      // Iterate through each intersection's in-out path and add a particle for each point along that path
      this._intersections.forEach((intersection) => {
        for (const s of intersection.inOutPaths)
          for (const p of s.points) {
            intersectionPointBuilder.addParticle({ size: 1, x: p.x, y: p.y, z: p.z });
          }
      });
    }

    // Add the decorations to the context
    // *Note* because location and line width do not need to be updated when the camera or zoom levels change,
    // the line graphic doesn't need to be recreated on each call to decorate. This graphic is created once
    // via`initialize` in the constructor and reapplied to the context here. This helps improve performance
    if (this._lineGraphic)
      context.addDecoration(GraphicType.WorldDecoration, this._lineGraphic);

    const roadGraphic = roadPointBuilder.finish();
    if (roadGraphic) context.addDecoration(GraphicType.WorldDecoration, roadGraphic);

    const intersectionGraphic = intersectionPointBuilder.finish();
    if (intersectionGraphic) context.addDecoration(GraphicType.WorldDecoration, intersectionGraphic);
  }

  /** Allocates memory and creates a RenderTexture from a given URL. */
  private static async allocateTextureFromUrl(
    url: string
  ): Promise<RenderTexture | undefined> {
    // Note: the caller takes ownership of the textures, and disposes of those resources when they are no longer needed.
    const textureImage = await imageElementFromUrl(url);
    const image: TextureImage = {
      source: textureImage,
      transparency: TextureTransparency.Translucent,
    };
    return IModelApp.renderSystem.createTexture({
      type: RenderTexture.Type.Normal,
      image,
      ownership: "external",
    });
  }

  /** If the textures are not created yet, will attempt to create them.  Returns true if successful. */
  private async tryTextures(imageUrls: [string, string]): Promise<boolean> {
    if (!this._roadPointTexture) {
      const image = await RoadDecorator.allocateTextureFromUrl(imageUrls[0]);
      if (image) this._roadPointTexture = image;
    }

    if (!this._intersectionPointTexture) {
      const image = await RoadDecorator.allocateTextureFromUrl(imageUrls[1]);
      if (image) this._intersectionPointTexture = image;
    }

    // Invalidate the decorations now that the textures have been created
    IModelApp.viewManager.selectedView?.invalidateDecorations();
    return this._roadPointTexture !== undefined && this._intersectionPointTexture !== undefined;
  }

  /** Creates the line graphics to be reused on decorate */
  private initialize() {
    // Create the graphic builder
    const lineBuilder = IModelApp.renderSystem.createGraphicBuilder(
      Transform.createIdentity(),
      GraphicType.WorldDecoration,
      IModelApp.viewManager.selectedView!,
      this._getNextPickableId()
    );

    // Iterate through the streets and create red linestrings for each street
    lineBuilder.setSymbology(ColorDef.red, ColorDef.black, 2);

    this._streets.forEach((street, index) => {
      const pickableId = this._getNextPickableId();
      this._pickableIdsStreets.set(pickableId, index);
      lineBuilder.activatePickableId(pickableId);
      lineBuilder.addLineString(street.points);
    });

    // Iterate through the intersections and create blue linestrings for each intersection's in-out path
    if (this._showIntersections) {
      lineBuilder.setSymbology(ColorDef.blue, ColorDef.black, 2);
      this._intersections.forEach((intersection, intersectionId) => {
        for (const path of intersection.inOutPaths) {
          const pickableId = this._getNextPickableId();
          this._pickableIdsIntersections.set(pickableId, { intersectionId, pathId: path.id });
          lineBuilder.activatePickableId(pickableId);
          lineBuilder.addLineString(path.points);
        }
      });
    }

    // Finish the graphic builder and add give the graphics an owner
    const gx = lineBuilder.finish();
    this._lineGraphic = IModelApp.renderSystem.createGraphicOwner(gx);

    // Invalidate decorations now that the line graphics have been created
    IModelApp.viewManager.selectedView?.invalidateDecorations();
  }
}
