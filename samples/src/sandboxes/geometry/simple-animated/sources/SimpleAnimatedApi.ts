/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { LineString3d, Loop, Point3d } from "@itwin/core-geometry";
import { Timer } from "@itwin/core-react";
import { GeometryDecorator } from "./common/utils/GeometryDecorator";

export default class SimpleAnimatedApi {

  public static createGridSquares(grid: boolean[][]) {
    const squares: Loop[] = [];
    const squareSize = 20;
    // tslint:disable-next-line: prefer-for-of
    for (let i: number = 0; i < grid.length; i++) {
      for (let j: number = 0; j < grid[0].length; j++) {
        if (grid[i][j]) {
          const corners: Point3d[] = [];
          corners.push(Point3d.create(i * squareSize, j * squareSize, 0));
          corners.push(Point3d.create(i * squareSize + squareSize, j * squareSize, 0));
          corners.push(Point3d.create(i * squareSize + squareSize, j * squareSize + squareSize, 0));
          corners.push(Point3d.create(i * squareSize, j * squareSize + squareSize, 0));
          corners.push(Point3d.create(i * squareSize, j * squareSize, 0));
          const square = LineString3d.create(corners);
          const loop = Loop.create(square.clone());
          squares.push(loop);
        }
      }
    }
    return squares;
  }
}

export class AnimatedGeometryDecorator extends GeometryDecorator {
  private timer?: Timer;

  /** Used to create animated geometry decorations
  * @param callback Function to call periodically.  Can add or clear geometry.
  * @param delay Number of ms between calls to animation callback
  * */
  public setAnimationCallback(callback: () => void, delay: number) {
    this.timer?.stop();
    this.timer = undefined;

    if (delay > 0) {
      this.timer = new Timer(delay);
      this.timer.setOnExecute(callback);
      this.timer.start();
      return;
    }
  }
}

