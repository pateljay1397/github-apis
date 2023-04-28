/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Camera, SpatialViewDefinitionProps } from "@itwin/core-common";
import { ScreenViewport, ViewCreator3d, ViewState } from "@itwin/core-frontend";
import { Point3d, Vector3d, YawPitchRollAngles } from "@itwin/core-geometry";
import { SavedViewItwin3dViewInterface } from "./SavedViewsInterfaces";

/**
 * Saved view Itwin JS view state parser.
 */
export class SavedViewItwinJsViewStateParser {

  /**
   * Creates SavedViewItwin3dView from ItwinJS view state.
   * @param viewPort name of the screen view port.
   * @returns SavedViewItwin3dView
   */
  public static fromItwinJsViewState(viewPort: ScreenViewport): SavedViewItwin3dViewInterface {
    if (!viewPort.view.isSpatialView()) {
      throw new Error("Not implemented for other views, please go to https://developer.bentley.com/apis/savedviews for more info.");
    }
    const viewState = viewPort.view;
    // Above spatialView checks confirms we'll get SpatialViewDefinitionProps.
    const viewProps = viewState.toProps().viewDefinitionProps as SpatialViewDefinitionProps;
    const savedView: SavedViewItwin3dViewInterface = {
      origin: viewProps.origin,
      extents: viewProps.extents,
      angles: viewProps.angles,
      camera: viewProps.camera,
    };
    savedView.categories = { enabled: [...viewState.categorySelector.categories] };
    savedView.models = { enabled: [...viewState.modelSelector.models] };
    return savedView;
  }

  /**
   * Updates ViewState3d from saved view Itwin 3d view interface.
   * @param savedView name of the saved view.
   * @param viewPort name of the screen view port.
   * @returns Promise<ViewState>
   */
  public static async toItwinJsViewState(savedView: SavedViewItwin3dViewInterface, viewPort: ScreenViewport): Promise<ViewState> {
    const iModelConnection = viewPort.iModel;
    const viewState = await new ViewCreator3d(iModelConnection).createDefaultView({ cameraOn: savedView.camera ? true : false }, savedView.models?.enabled);
    viewState.setOrigin(Point3d.fromJSON(savedView.origin));
    viewState.setExtents(Vector3d.fromJSON(savedView.extents));
    if (savedView.angles) {
      const angles = YawPitchRollAngles.fromJSON(savedView.angles);
      viewState.setRotation(angles.toMatrix3d());
    }
    if (viewState.is3d() && savedView.camera) {
      const camera = new Camera(savedView.camera);
      viewState.camera.setFrom(camera);
    }
    if (savedView.categories?.enabled && savedView.categories.enabled.length > 0) {
      viewState.categorySelector.categories.clear();
      viewState.categorySelector.addCategories(savedView.categories.enabled);
    }
    viewState.setDisplayStyle(viewPort.displayStyle);
    return viewState;
  }
}
