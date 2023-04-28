/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Cartographic } from "@itwin/core-common";
import { Viewport } from "@itwin/core-frontend";
import { Point3d, Range2d, Vector3d } from "@itwin/core-geometry";
interface LatLonProps {
  lat?: number;
  lon?: number;
}

interface OpenStreetMapElement {
  type: string;
  id: number;
  bounds: {
    minlat: number;
    minlon: number;
    maxlat: number;
    maxlon: number;
  };
  nodes: number[];
  geometry: LatLonProps[];
  tags?: any;
}

interface OpenStreetMapData {
  version: number;
  generator: string;
  osm3s: {
    timestamp_osm_base: string;
    copyright: string;
  };
  elements: OpenStreetMapElement[];
}

/** Highway tag values that mark street types. See https://wiki.openstreetmap.org/wiki/Key:highway#Roads for more info about specific highway tags */
export enum HighwayTag {
  unclassified = "unclassified",
  service = "service",
  living_street = "living_street",
  residential = "residential",
  tertiary_link = "tertiary_link",
  tertiary = "tertiary",
  secondary_link = "secondary_link",
  secondary = "secondary",
  primary_link = "primary_link",
  primary = "primary",
  trunk_link = "trunk_link",
  trunk = "trunk",
  motorway_link = "motorway_link",
  motorway = "motorway",
}

export const carSizeDefaultX = 7.0;
export const carSizeDefaultY = 3.1;
export interface StreetsAndIntersections {
  streets: Street[];
  intersections: Map<number, Intersection>;
  startStreetIndices: number[];
  startStreetProbabilities: number[];
}

export class Street {
  public name: string;
  public points: Point3d[] = []; // in order of street direction from first point to last point
  public distance: number[] = []; // distance between one point and another, the length of this will be one less than the length of points[]
  public speed: number = 35; // in meters per second
  public outOf: number; // index of intersection out of which this street flows (-1 if none) or street out of which intersection path flows
  public inTo: number; // index of intersection into which this street flows (-1 if none) or street into which intersection path flows
  public totalDistance: number;
  public readonly id: number;
  public isJunction: boolean;
  public highway: string; // highway tag from OSM
  public isOneway: boolean;
  public tags: any; // comes directly from OSM

  public constructor(
    name: string,
    outOf: number,
    into: number,
    speed: number,
    isJunction: boolean,
    id: number,
    highway: string,
    isOneway: boolean,
    tags: any,
    points: Point3d[]
  ) {
    for (const p of points) this.points.push(p.clone());
    this.totalDistance = 0;
    this.setDistances();
    this.name = name;
    this.outOf = outOf;
    this.inTo = into;
    this.speed = speed;
    this.id = id;
    this.highway = highway;
    this.isJunction = isJunction;
    this.isOneway = isOneway;
    this.tags = tags;
  }

  public static create(
    name: string,
    outOf: number,
    into: number,
    speed: number,
    isJunction: boolean,
    id: number,
    highway: string,
    isOneway: boolean,
    tags: any,
    ...points: Point3d[]
  ): Street {
    return new Street(
      name,
      outOf,
      into,
      speed,
      isJunction,
      id,
      highway,
      isOneway,
      tags,
      points
    );
  }

  /** Populates the distance array - this needs to be called after points are added or changed */
  public setDistances(): void {
    this.totalDistance = 0;
    this.distance.length = 0;
    for (let i = 0; i < this.points.length - 1; ++i) {
      const d = this.points[i].distance(this.points[i + 1]);
      this.distance.push(d);
      this.totalDistance += d;
    }
  }
}

export class Intersection {
  public centerPoint: Point3d;
  public streetsIn: number[] = []; // indices of streets that flow into this intersection.
  public streetsOut: number[] = []; // indices of streets that flow out of this intersection.
  public inOutPaths: Street[] = []; // paths from every streetIn to every streetOut.
  public inOutProbabilities: Map<number, number[]>; // probability of taking each street.
  public stop: boolean = true; // whether or not a car will stop at this intersection

  public constructor(centerPoint: Point3d) {
    this.centerPoint = centerPoint.clone();
    this.inOutProbabilities = new Map<number, number[]>();
  }

  public addStreetIn(streetIndex: number) {
    this.streetsIn.push(streetIndex);
  }

  public addStreetOut(streetIndex: number) {
    this.streetsOut.push(streetIndex);
  }

  public findPath(outOf: number, inTo: number): number {
    for (let p = 0; p < this.inOutPaths.length; ++p) {
      if (
        this.inOutPaths[p].outOf === outOf &&
        this.inOutPaths[p].inTo === inTo
      )
        return p;
    }
    return -1;
  }
}

export class OverpassApi {
  private static _uTurnRadians = -0.86;
  private static _straightRadians = 0.9;
  private static _nextStreetId = 0;
  private static _undefinedStreetId = 0;
  private static _wayCounts: Map<number, number> = new Map<number, number>();
  private static _streets: Street[] = [];
  private static _leftSide: boolean = false;

  /** Creates a map that contains a list of street indices and a count for how many times they are used by other streets */
  private static _generateWayCount(
    elements: OpenStreetMapElement[],
    highwayTags: string[]
  ): Map<number, number> {
    const wayCount = new Map<number, number>();
    for (const el of elements) {
      if (this._isRoad(highwayTags, el)) {
        const nodeArray = el.nodes;
        const geomArray = el.geometry as any[];

        // Iterate through each node on an element and add to its count
        for (let n = 0; n < nodeArray.length && n < geomArray.length; ++n) {
          if (null === geomArray[n]) continue;
          const nodeId = nodeArray[n];
          let count = wayCount.get(nodeId);
          if (undefined === count) count = 1;
          else count += 1;
          wayCount.set(nodeId, count);
        }
      }
    }
    return wayCount;
  }

  /** Iterates through OSM elements to create street segments between intersections*/
  private static _createStreets(
    elements: OpenStreetMapElement[],
    highwayTags: string[],
    viewport: Viewport,
    leftSide: boolean
  ): Street[] {
    const streets: Street[] = [];
    for (const el of elements) {
      if (this._isRoad(highwayTags, el)) {
        // Get street information
        const speed = this._roadSpeed(el.tags) * 0.44704; // Convert from miles per hour to meters per second
        const lanes = this._getRoadLanes(el.tags);
        const name = this._getStreetName(el.tags);
        const highway = this._getHighwayType(el.tags);
        const isJunction = this._streetIsJunction(el.tags);
        const tags = el.tags;

        // Initialize inTo/outOf indexes with a value of -1 to indicate no intersection
        let intersectionOutOf = -1;
        let intersectionInto = -1;

        // Initialize points to an empty array - points will hold all the points contained on a street
        const points: Point3d[] = [];

        // Initialize node and geometry data - the node array contains node ids, the geometry array contains their associated lat and lons
        const nodeArray = el.nodes;
        const geomArray = el.geometry;

        // If true, indicates that this point is the first point on a street
        let first = true;

        // Current point being looked at
        let pointOnStreet: Point3d;

        // Iterate through all the nodes on an element and create streets between intersections
        for (
          let geomIndex = 0;
          geomIndex < geomArray.length && geomIndex < nodeArray.length;
          ++geomIndex
        ) {
          // Check to make sure latitude and longitude are defined, if they aren't, this node must be out of range, so skip it
          if (undefined === this._getLatLon(geomArray[geomIndex])) continue;

          // Add current point to set of points on street
          pointOnStreet = this._geometryToPoint(geomArray[geomIndex], viewport);
          points.push(pointOnStreet.clone());

          const nodeId = nodeArray[geomIndex];
          const wayCount = this._wayCounts.get(nodeId) || 0;

          // Set the start intersection or create the street from start to end
          if (first) {
            // This is the first intersection/node along the current street
            intersectionOutOf = nodeId ?? -1;
            first = false;
          } else if (wayCount > 1) {
            // Create street from one intersection to another and end the street at this intersection
            intersectionInto = nodeId;
            const newStreets = this._makeStreet(
              name,
              intersectionOutOf,
              intersectionInto,
              speed,
              lanes.forward,
              lanes.backward,
              isJunction,
              leftSide,
              highway,
              tags,
              points
            );
            streets.push(...newStreets);

            // Start a new street along this same way, starting at this intersection.
            points.length = 0;
            points.push(pointOnStreet.clone());
            intersectionOutOf = intersectionInto;
            intersectionInto = -1;
          }
        }

        if (points.length > 3) {
          const newStreets = this._makeStreet(
            name,
            intersectionOutOf,
            intersectionInto,
            speed,
            lanes.forward,
            lanes.backward,
            isJunction,
            leftSide,
            highway,
            tags,
            points
          );
          streets.push(...newStreets);
        }
      }
    }
    return streets;
  }

  /** Iterates through streets to reverse the direction the street is pointing */
  private static _reverseStreets(streets: Street[]): Street[] {
    return streets.map((street) => {
      if (!street.isOneway) {
        const inTo = street.inTo;
        street.inTo = street.outOf;
        street.outOf = inTo;
        street.points.reverse();
        street.setDistances();
      }

      return street;
    });
  }

  /** Returns intersection data created after iterating through each street */
  private static _createIntersections(
    streets: Street[]
  ): Map<number, Intersection> {
    const intersections = new Map<number, Intersection>();

    // Populate the intersections map with nodeIds
    streets.forEach((street) => {
      const intoWayCount = this._wayCounts.get(street.inTo) || 0;
      if (
        street.inTo !== -1 &&
        intoWayCount > 1 &&
        !intersections.get(street.inTo)
      ) {
        const inToPoint = street.points[street.points.length - 1];
        intersections.set(street.inTo, new Intersection(inToPoint));
      }
    });

    // Set up which streets are going into each intersection and which are coming out
    for (let streetIndex = 0; streetIndex < streets.length; streetIndex++) {
      // Add streets into intersections
      if (streets[streetIndex].inTo !== -1) {
        intersections.get(streets[streetIndex].inTo)?.addStreetIn(streetIndex);
      }

      // Add streets out of intersections
      if (streets[streetIndex].outOf !== -1) {
        intersections
          .get(streets[streetIndex].outOf)
          ?.addStreetOut(streetIndex);
      }
    }

    // Set up intersection paths (mini streets) to go from each in street to each out street and probabilities of taking each
    // Direction vectors of incoming and outgoing streets
    const inDirection = Vector3d.create();
    const outDirection = Vector3d.create();

    // Points inside an intersection that travel from pMid1 -> pMid2 -> pMid3
    const pMid1 = Point3d.create();
    const pMid2 = Point3d.create();
    const pMid3 = Point3d.create();

    // Iterate through the streets into and out of an intersection
    intersections.forEach((intersection) => {
      for (const sI of intersection.streetsIn) {
        for (const sO of intersection.streetsOut) {
          if (streets[sI].isJunction || streets[sO].isJunction) {
            // If just one of these is not a junction then fix up its last point so that it goes all the way to the junction
            if (streets[sI].isJunction && !streets[sO].isJunction) {
              streets[sO].points[0].setFrom(
                streets[sI].points[streets[sI].points.length - 1]
              );
              streets[sO].setDistances();
            } else if (!streets[sI].isJunction && streets[sO].isJunction) {
              streets[sI].points[streets[sI].points.length - 1].setFrom(
                streets[sO].points[0]
              );
              streets[sI].setDistances();
            }
            // Intersection paths for junctions aren't needed since they connect directly to them, so skip path creation
            continue;
          }

          // Set speed to the slower of the two paths with a default of 35
          let speed = 35;
          if (sI !== -1 && streets[sI].speed < speed) speed = streets[sI].speed;
          if (sO !== -1 && streets[sO].speed < speed) speed = streets[sO].speed;

          // Car travels on this path p0 -> p1 -> p2 -> p3
          const p0 = streets[sI].points[streets[sI].points.length - 2]; // Second to last point on street into
          const p1 = streets[sI].points[streets[sI].points.length - 1]; // Last point on street into
          const p2 = streets[sO].points[0]; // Last point on street out of
          const p3 = streets[sO].points[1]; // Second to last point on street out of

          // Create direction vectors
          Vector3d.createStartEnd(p0, p1, inDirection);
          Vector3d.createStartEnd(p2, p3, outDirection);
          inDirection.normalizeInPlace();
          outDirection.normalizeInPlace();
          let center: Point3d;

          // Calculate dot product between two normalized vectors to determine if streets are inline or a u-turn
          // Dot products are a single value that show how "similar" two vectors are by providing info about the angle between to vectors
          // The more positive the angle between the two vectors, the closer these lines are to overlapping, the more negative, the farther
          // If the dot product is 0, they are perfectly perpendicular
          // Because we're using normalized vectors, we know the highest value is 1 and the lowest is -1. We can use these to determine if we're looking at
          // u-turns or straight-a-ways. Here we're allowing some grey area and fuzziness by using _straightRadians and _uTurnRadians
          const dot = inDirection.dotProduct(outDirection);
          if (dot > this._straightRadians) {
            // Next street continues straight so we don't need to make an arc
            intersection.inOutPaths.push(
              Street.create(
                "",
                sI,
                sO,
                speed,
                false,
                this._nextStreetId,
                "",
                true,
                undefined,
                p1,
                p2
              )
            );
            this._nextStreetId++;
          } else {
            if (dot < this._uTurnRadians) {
              // This is a u-turn, or nearly one
              const dist = p1.distance(p2);
              pMid1.set(
                p1.x + inDirection.x * dist,
                p1.y + inDirection.y * dist,
                intersection.centerPoint.z
              );
              pMid2.set(
                p2.x - outDirection.x * dist,
                p2.y - outDirection.y * dist,
                intersection.centerPoint.z
              );
              center = Point3d.createAdd2Scaled(pMid1, 0.5, pMid2, 0.5);
            } else {
              // This is a standard turn, so find the center point between the two lines
              center = this._findIntersection(p0, p1, p2, p3);
            }
            // Midpoint from p1 to center
            pMid1.setFrom(p1);
            pMid1.addInPlace(center);
            pMid1.scaleInPlace(0.5);

            // Midpoint from p2 to the center
            pMid3.setFrom(p2);
            pMid3.addInPlace(center);
            pMid3.scaleInPlace(0.5);

            // Creates a "point along arc"
            pMid2.setFrom(pMid1);
            pMid2.addInPlace(pMid3);
            pMid2.addInPlace(center);
            pMid2.scaleInPlace(1.0 / 3.0);
            intersection.inOutPaths.push(
              Street.create(
                "",
                sI,
                sO,
                speed,
                false,
                this._nextStreetId,
                "",
                true,
                undefined,
                p1,
                pMid1,
                pMid2,
                pMid3,
                p2
              )
            );
            this._nextStreetId++;
          }
        }
        const probabilities = this._computeStreetProbabilities(
          streets,
          sI,
          intersection.streetsOut
        );
        intersection.inOutProbabilities.set(sI, probabilities);
      }

      // See if cars should stop here (only stop if cars would be coming in from more than one street).
      intersection.stop = false;
      for (let i = 1; i < intersection.streetsIn.length; ++i) {
        if (
          streets[intersection.streetsIn[i]].name !==
          streets[intersection.streetsIn[i - 1]].name
        )
          intersection.stop = true;
      }
    });

    return intersections;
  }

  /** Returns a list of streets for cars to start at */
  private static _createStartStreetIndices(
    streets: Street[],
    intersections: Map<number, Intersection>
  ): number[] {
    // Make a list of streets coming into the system for new cars to enter.
    const startStreetIndices: number[] = [];

    // Add streets that aren't coming out of an intersection
    for (let sIndex = 0; sIndex < streets.length; ++sIndex) {
      if (streets[sIndex].outOf < 0) startStreetIndices.push(sIndex);
    }

    if (0 === startStreetIndices.length) {
      // See if there are any intersections that have no streets coming in and start them on the streets going out.
      intersections.forEach((intersection) => {
        if (intersection.streetsIn.length === 0) {
          for (const sIndex of intersection.streetsOut)
            startStreetIndices.push(sIndex);
        }
      });
    }

    if (0 === startStreetIndices.length) {
      // Still have no start streets, so just use them all.
      for (let sIndex = 0; sIndex < streets.length; ++sIndex) {
        startStreetIndices.push(sIndex);
      }
    }

    return startStreetIndices;
  }

  /** Returns a list of the likely-hood that a street should be taken, the higher the speed limit of the road, the more weight that street has */
  private static _computeStreetProbabilities(
    streets: Street[],
    sI: number | undefined,
    streetsOut: number[]
  ): number[] {
    const probabilities: number[] = [];
    // Probabilities will be proportional to the square of the speed of each out-going street.
    // Probability of u-turns is 0.
    const dirIn = Vector3d.create();
    const dirOut = Vector3d.create();
    let streetInId = -1;

    // Calculate incoming direction
    if (undefined !== sI) {
      const streetIn = streets[sI];
      streetInId = streetIn.id;
      const numPointIn = streetIn.points.length;
      Vector3d.createStartEnd(
        streetIn.points[numPointIn - 2],
        streetIn.points[numPointIn - 1],
        dirIn
      );
      dirIn.normalizeInPlace();
    }

    // Iterate through outgoing streets and populate probabilities with the square of a street's speed
    let totalSpeed = 0;
    for (const sO of streetsOut) {
      let dot = 1.0;
      if (undefined !== sI) {
        Vector3d.createStartEnd(
          streets[sO].points[0],
          streets[sO].points[1],
          dirOut
        );
        dirOut.normalizeInPlace();
        dot = dirIn.dotProductXY(dirOut);
      }
      if (streets[sO].id === streetInId || dot < this._uTurnRadians) {
        probabilities.push(0); // is a U-turn
      } else {
        const p = streets[sO].speed * streets[sO].speed;
        probabilities.push(p);
        totalSpeed += p;
      }
    }

    // Normalize priorities so that they add to 1
    let totalProb = 0;
    for (let i = 0; i < probabilities.length; ++i) {
      let probability = 0;

      if (0 === totalSpeed) {
        // Only U-turns exist, so make them all same probability
        probability = 1.0 / probabilities.length;
      } else {
        probability = probabilities[i] / totalSpeed;
      }

      totalProb += probability;
      probabilities[i] = totalProb;
    }

    return probabilities;
  }

  /** Calculates and returns the lat/lon range of the viewport */
  private static _getViewExtents(viewport: Viewport): Range2d {
    // get center point and extents (width) in view coordinates
    const target = viewport.view.getTargetPoint();
    const extents = viewport.view.getExtents().clone();
    extents.scaleInPlace(0.5);

    // get all the corners in view coordinates
    const corners: Array<Point3d> = [];
    corners.push(target.plusXYZ(-extents.x, -extents.y, 0));
    corners.push(target.plusXYZ(-extents.x, extents.y, 0));
    corners.push(target.plusXYZ(extents.x, -extents.y, 0));
    corners.push(target.plusXYZ(extents.x, extents.y, 0));

    // check that there's a background map to apply our lat and lons to
    if (undefined === viewport.backgroundMapGeometry)
      return new Range2d(0, 0, 0, 0);

    // get the first corner in cartographic coordinates and use it to set our initial lat and lons
    const cg = viewport.backgroundMapGeometry.dbToCartographic(corners[0]);
    let minLat = cg.latitudeDegrees;
    let maxLat = minLat;
    let minLon = cg.longitudeDegrees;
    let maxLon = minLon;

    // get the min/max lons out of the four corners
    for (let i = 1; i < corners.length; ++i) {
      viewport.backgroundMapGeometry.dbToCartographic(corners[i], cg);
      if (cg.latitudeDegrees < minLat) minLat = cg.latitudeDegrees;
      else if (cg.latitudeDegrees > maxLat) maxLat = cg.latitudeDegrees;
      if (cg.longitudeDegrees < minLon) minLon = cg.longitudeDegrees;
      else if (cg.longitudeDegrees > maxLon) maxLon = cg.longitudeDegrees;
    }

    return new Range2d(minLon, minLat, maxLon, maxLat);
  }

  /** Fetches and returns street map data, if provided, it will only query for the given highway types.
   *  NOTE: This data comes from OpenStreetMap and is made available under the Open Database License.
   *  See https://www.openstreetmap.org/copyright for more details.
   *  For more information on how this URL in this method is formed, see https://wiki.openstreetmap.org/wiki/Overpass_API/Language_Guide
   */
  private static async _obtainStreetData(
    range: Range2d,
    highwayTypes?: string[]
  ): Promise<OpenStreetMapData | undefined> {
    const base_url = "https://overpass-api.de/api/interpreter";

    // If passed in, construct POSIX regex to filter query by highway types
    // If no highway types passed in, query for all entries that include a highway type regardless of what the type is
    const tagExpression = highwayTypes
      ? highwayTypes.map((tag) => `^${tag}$`).join("|")
      : ".*";

    const rangeString = `(${range.yLow},${range.xLow},${range.yHigh},${range.xHigh})`;
    const url = `${base_url}?data=[out:json];way[highway~%22${tagExpression}%22]${rangeString};out%20geom${rangeString};`;
    const response = await fetch(url);

    if (response.ok) {
      return response.json();
    } else {
      throw response.statusText;
    }
  }

  /** Verifies that necessary tags exist and highwayTag matches one of the given highway tag values */
  private static _isRoad(
    highwayTags: string[],
    element: OpenStreetMapElement
  ): boolean {
    return (
      undefined !== element.type &&
      element.type === "way" &&
      undefined !== element.id &&
      undefined !== element.geometry &&
      undefined !== element.nodes &&
      undefined !== element.tags &&
      undefined !== element.tags.highway &&
      highwayTags.includes(element.tags.highway)
    );
  }

  /** Returns road speed in miles per hour based on speed tag if found or highway tag */
  private static _roadSpeed(tags: any): number {
    if (undefined === tags) return 35;
    if (undefined !== tags.maxspeed) {
      let speed = tags.maxspeed as string;
      if (speed.includes(" mph")) {
        speed = speed.slice(0, speed.indexOf(" "));
        return Number.parseInt(speed, 10);
      }
      if (
        speed.includes(" km/h") ||
        speed.includes(" kmh") ||
        speed.includes(" kph")
      ) {
        speed = speed.slice(0, speed.indexOf(" "));
        return Number.parseInt(speed, 10) * 0.621371;
      }
    }

    if (tags.highway === undefined) return 35;
    if (tags.highway === HighwayTag.motorway) return 70;
    if (tags.highway === HighwayTag.trunk) return 65;
    if (tags.highway === HighwayTag.primary) return 55;
    if (tags.highway === HighwayTag.secondary) return 45;
    if (tags.highway === HighwayTag.tertiary) return 35;
    if (tags.highway === HighwayTag.unclassified) return 35;
    if (tags.highway === HighwayTag.residential) return 25;
    if (tags.highway === HighwayTag.motorway_link) return 55;
    if (tags.highway === HighwayTag.trunk_link) return 40;
    if (tags.highway === HighwayTag.primary_link) return 30;
    if (tags.highway === HighwayTag.secondary_link) return 30;
    if (tags.highway === HighwayTag.tertiary_link) return 25;
    if (tags.highway === HighwayTag.living_street) return 25;
    if (tags.highway === HighwayTag.service) return 10;
    return 35;
  }

  /** Returns the number of lanes traveling in each direction of a road - it's restricted to only allowing one lane in each direction */
  private static _getRoadLanes(tags: any): {
    forward: number;
    backward: number;
  } {
    let lanes;
    let forward = 1;
    let backward = 1;
    if (undefined !== tags) {
      if (undefined !== tags.lanes) lanes = tags.lanes as number;

      if (undefined !== tags.oneway) {
        if ("yes" === tags.oneway) {
          forward = lanes ?? 1;
          backward = 0;
        } else if ("-1" === tags.oneway) {
          forward = 0;
          backward = lanes ?? 1;
        }
      } else {
        if (undefined === lanes) lanes = 2;
        forward = Math.round(lanes * 0.5);
        backward = lanes - forward;
      }
      if (this._streetIsJunction(tags)) {
        backward = 0;
      }
    }

    // For now restrict it to one lane in each direction.
    forward = forward > 1 ? 1 : forward;
    backward = backward > 1 ? 1 : backward;

    return { forward, backward };
  }

  /** Searches the OSM tags for street name and generates a name if no name is found (ex. if street is a junction) */
  private static _getStreetName(tags: any): string {
    if (undefined === tags || undefined === tags.name)
      return `undefined${this._undefinedStreetId++}`;
    return tags.name;
  }

  /** Searches the OSM tags for highway type */
  private static _getHighwayType(tags: any): string {
    if (undefined === tags || undefined === tags.highway) return "";
    return tags.highway;
  }

  /** Searches the OSM tags for whether or not a street is a junction - see https://wiki.openstreetmap.org/wiki/Key:junction for more details */
  private static _streetIsJunction(tags: any): boolean {
    if (undefined === tags || undefined === tags.junction) return false;
    return true;
  }

  /** Returns an array of streets containing the forward and backwards streets if they exist
   *  Individual streets are made for each lane on a street
   */
  private static _makeStreet(
    name: string,
    intersectionOutOf: number,
    intersectionInto: number,
    speed: number,
    lanesF: number,
    lanesB: number,
    isJunction: boolean,
    leftSide: boolean,
    highway: string,
    tags: any,
    points: Point3d[]
  ): Street[] {
    // Make sure that there are enough points and lanes to make streets
    if (points.length < 2 || 0 === lanesF + lanesB) return [];

    const streets: Street[] = [];

    // Since the street goes all the way to the middle of the intersection, try and pull back the street a reasonable distance on both ends
    if (!isJunction) {
      const distBack = carSizeDefaultX;
      let dir = Vector3d.createStartEnd(points[0], points[1]);
      let result = dir.normalizeWithLength(dir);
      if (undefined !== dir)
        points[0].addScaledInPlace(
          dir,
          distBack < result.mag - 1 ? distBack : result.mag - 1
        );
      dir = Vector3d.createStartEnd(
        points[points.length - 1],
        points[points.length - 2]
      );
      result = dir.normalizeWithLength(dir);
      if (undefined !== dir)
        points[points.length - 1].addScaledInPlace(
          dir,
          distBack < result.mag - 1 ? distBack : result.mag - 1
        );
    }

    // Copy the points in reverse order if any lanes are going backwards.
    const reversePoints: Point3d[] = [];
    if (lanesB > 0) {
      for (let p = points.length - 1; p >= 0; --p) {
        reversePoints.push(points[p].clone());
      }
    }

    // Compute how far to shift the first forward & backwards lanes and then shift them and make the streets for them.
    const laneSize = carSizeDefaultY * 1.25 * (leftSide ? -1 : 1);
    let shiftF: number;
    let shiftB: number;

    const isOneway = !(lanesF > 0 && lanesB > 0);

    if (lanesF > 0 && lanesB > 0) {
      // Lanes going in different directions, so create a street going in each direction
      // Shift lanes off centerline
      shiftF = 0.5 - (lanesF - lanesB);
      shiftB = 1.0 - shiftF;
      this._shiftPoints(points, shiftF * laneSize);
      this._shiftPoints(reversePoints, shiftB * laneSize);

      // Create streets
      streets.push(
        new Street(
          name,
          intersectionOutOf,
          intersectionInto,
          speed,
          isJunction,
          this._nextStreetId,
          highway,
          isOneway,
          tags,
          points
        )
      );
      streets.push(
        new Street(
          name,
          intersectionInto,
          intersectionOutOf,
          speed,
          isJunction,
          this._nextStreetId,
          highway,
          isOneway,
          tags,
          reversePoints
        )
      );
    } else if (lanesF > 0) {
      // Lanes are only going forward
      shiftF = (lanesF - 1) * -0.5;
      this._shiftPoints(points, shiftF * laneSize);
      streets.push(
        new Street(
          name,
          intersectionOutOf,
          intersectionInto,
          speed,
          isJunction,
          this._nextStreetId,
          highway,
          isOneway,
          tags,
          points
        )
      );
    } else if (lanesB > 0) {
      // Lanes are only going backward
      shiftB = (lanesB - 1) * -0.5;
      this._shiftPoints(reversePoints, shiftB * laneSize);
      streets.push(
        new Street(
          name,
          intersectionInto,
          intersectionOutOf,
          speed,
          isJunction,
          this._nextStreetId,
          highway,
          isOneway,
          tags,
          reversePoints
        )
      );
    }

    // Make the rest of the forward lanes, shifting each time by a lane width.
    for (let i = 1; i < lanesF; ++i) {
      this._shiftPoints(points, laneSize);
      streets.push(
        new Street(
          name,
          intersectionOutOf,
          intersectionInto,
          speed,
          isJunction,
          this._nextStreetId,
          highway,
          isOneway,
          tags,
          points
        )
      );
    }

    // Make the rest of the backward lanes, shifting each time by a lane width.
    for (let i = 1; i < lanesB; ++i) {
      this._shiftPoints(reversePoints, laneSize);
      streets.push(
        new Street(
          name,
          intersectionInto,
          intersectionOutOf,
          speed,
          isJunction,
          this._nextStreetId,
          highway,
          isOneway,
          tags,
          reversePoints
        )
      );
    }

    ++this._nextStreetId;
    return streets;
  }

  /** Shifts the points perpendicularly a distance off a line
   *  NOTE: this manipulates the point array passed in
   */
  private static _shiftPoints(points: Point3d[], dist: number): void {
    let dir: Vector3d;
    let dir2: Vector3d;
    const numPoints = points.length;
    for (let pointIndex = 0; pointIndex < points.length; ++pointIndex) {
      if (0 === pointIndex) {
        // first point
        dir = Vector3d.createStartEnd(points[0], points[1]);
      } else if (numPoints - 1 === pointIndex) {
        // last point
        dir = Vector3d.createStartEnd(
          points[numPoints - 2],
          points[numPoints - 1]
        );
      } else {
        // points in the middle
        dir = Vector3d.createStartEnd(
          points[pointIndex - 1],
          points[pointIndex]
        );
        dir2 = Vector3d.createStartEnd(
          points[pointIndex],
          points[pointIndex + 1]
        );
        if (dir.normalizeInPlace() && dir2.normalizeInPlace())
          dir.addInPlace(dir2);
      }
      // rotate 90 degrees clockwise about z axis and get perpendicular line pointing to the right
      dir.set(dir.y, -dir.x, 0);
      if (dir.normalizeInPlace())
        points[pointIndex].addScaledInPlace(dir, dist); // move point `dist` units to along the perpendicular
    }
  }

  /** Takes a latitude and longitude and returns a point at that location */
  private static _geometryToPoint(
    json: LatLonProps,
    viewport: Viewport
  ): Point3d {
    if (
      undefined === json.lat ||
      undefined === json.lon ||
      undefined === viewport.backgroundMapGeometry
    ) {
      return Point3d.create(0, 0, 0);
    }
    const cg = Cartographic.fromDegrees({
      longitude: json.lon,
      latitude: json.lat,
      height: 0,
    });

    const result = viewport.backgroundMapGeometry.cartographicToDb(cg);
    const z = viewport.backgroundMapGeometry.getPointHeight(result);
    result.z = z ?? result.z;

    return result;
  }

  /** Returns the midpoint between one street and another street */
  private static _findIntersection(
    p0: Point3d,
    p1: Point3d,
    p2: Point3d,
    p3: Point3d
  ): Point3d {
    const d = (p0.x - p1.x) * (p3.y - p2.y) - (p0.y - p1.y) * (p3.x - p2.x);
    const t =
      ((p0.x - p3.x) * (p3.y - p2.y) - (p0.y - p3.y) * (p3.x - p2.x)) / d;
    const x = p0.x + t * (p1.x - p0.x);
    const y = p0.y + t * (p1.y - p0.y);
    const p = new Point3d(x, y, (p1.z + p2.z) * 0.5);
    return p;
  }

  /** Verifies that an object contains both a latitude and longitude */
  private static _getLatLon(
    json: LatLonProps
  ): { lat: number, lon: number } | undefined {
    if (null === json || undefined === json.lat || undefined === json.lon)
      return undefined;
    return { lat: json.lat, lon: json.lon };
  }

  /**
   * Fetches new data and creates streets and intersection from query results
   * @param leftSide - whether or not cars drive on the left side of the road
   * @param viewport
   * @param highwayTags - used to filter queried data and only create streets with one of these tags
   * @param queriedHighwayTags - filter applied to the query itself to prevent too much data from being returned
   * @returns created street and intersection data
   */
  public static async createStreetsAndIntersections(
    leftSide: boolean,
    viewport: Viewport,
    highwayTags?: string[],
    queriedHighwayTags?: string[]
  ): Promise<StreetsAndIntersections | undefined> {
    // Query API
    const viewportRange = this._getViewExtents(viewport);
    const streetData = await this._obtainStreetData(
      viewportRange,
      queriedHighwayTags
    );

    if (undefined === streetData || undefined === streetData.elements) return;

    // Generate streets and way counts
    this._leftSide = leftSide;
    this._wayCounts = this._generateWayCount(
      streetData.elements,
      highwayTags ?? Object.values(HighwayTag)
    );
    this._streets = this._createStreets(
      streetData.elements,
      highwayTags ?? Object.values(HighwayTag),
      viewport,
      leftSide
    );

    // Create intersections, start streets, and probabilities from street data
    const intersections = this._createIntersections(this._streets);
    const startStreetIndices = this._createStartStreetIndices(
      this._streets,
      intersections
    );
    const startStreetProbabilities = this._computeStreetProbabilities(
      this._streets,
      undefined,
      startStreetIndices
    );

    return {
      streets: this._streets,
      intersections,
      startStreetProbabilities,
      startStreetIndices,
    };
  }

  /**
   * Iterates through existing streets, updates them with the following parameters and recreates intersections, start streets, and start street probabilities
   * @param leftSide - whether or not cars drive on the left side of the road
   * @param highwayTags - used to filter street data and only create streets with one of these tags
   * @returns
   */
  public static async updateStreetsAndIntersections(
    leftSide: boolean,
    highwayTags?: string[]
  ): Promise<StreetsAndIntersections | undefined> {
    if (this._streets.length === 0) return;

    // Filter streets by highway tag
    let streets = highwayTags
      ? this._streets.filter((street) => highwayTags.includes(street.highway))
      : this._streets;

    // Reverse streets if leftSide has changed
    if (leftSide !== this._leftSide) {
      streets = this._reverseStreets(streets);
      this._leftSide = leftSide;
    }

    // Recreate intersections, start streets, and probabilities
    const intersections = this._createIntersections(streets);
    const startStreetIndices = this._createStartStreetIndices(
      streets,
      intersections
    );
    const startStreetProbabilities = this._computeStreetProbabilities(
      streets,
      undefined,
      startStreetIndices
    );
    return {
      streets,
      intersections,
      startStreetProbabilities,
      startStreetIndices,
    };
  }
}
