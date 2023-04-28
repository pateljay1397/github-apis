/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { CameraProps } from "@itwin/core-common";
import { TransformProps, XYProps, XYZProps, YawPitchRollProps } from "@itwin/core-geometry";

/**
 * Saved view group response link interface for other related resources reference.
 */
export interface GroupLinkInterface {
  /**
   * Hyperlink reference to iTwin.
   */
  iTwin: LinkInterface;

  /**
   *Hyperlink reference to imodel.
   */
  imodel?: LinkInterface;

  /**
   *Hyperlink reference to creator.
   */
  creator: LinkInterface;

  /**
   *Hyperlink reference to saved views.
   */
  savedViews: LinkInterface;
}

/**
 * Saved view group response interface for get group by ID.
 */
export interface GroupResponseInterface {
  /**
   * Unique identifier of saved view group.
   */
  id: string;

  /**
   * Display name of saved view group.
   */
  displayName: string;

  /**
   * Flag for whether or not saved view group is shared.
   */
  shared: boolean;

  /**
   * Reference link to related saved view group resources.
   */
  _links: GroupLinkInterface;
}

/**
 * Saved view group response list interface for get all saved view groups.
 */
export interface GroupsResponseInterface {
  /**
   * List of saved view groups.
   */
  groups: GroupResponseInterface[];

  /**
   * Reference link to related saved view groups self reference.
   */
  _links: SelfLinkInterface;
}

/**
 * Saved view Itwin Drawing View interface.
 */
export interface ItwinDrawingViewInterface {
  /**
     * Base model Id
     */
  baseModelId: string;

  /**
  * Origin. (Array of numbers representing x and y)
  */
  origin: XYProps;

  /**
  * Delta. (Array of numbers representing x and y)
  */
  delta: XYProps;

  /**
  * Angle, in degrees.
  */
  angle: number;

  /**
  * The categories of the view.
  */
  categories?: ItwinVisibilityListInterface;

  /**
  * The Id of the spatial view from which the SectionDrawing was generated.
  */
  spatialView?: string;

  /**
  * If true, the spatial view should be displayed in the context of the drawing view.
  */
  displaySpatialView?: boolean;

  /**
  * Transform from drawing coordinates to spatial coordinates. If undefined, use identity transform.
  * 3 X 4 transformation matrix containing 3 arrays of matrix rows consisting
  * of 4 numbers each: [qx qy qz ax] where the fourth column in each row holds the translation.
  */
  drawingToSpatialTransform?: TransformProps;

  /**
  * The extents of the DrawingModel, used for determining the upper limits of the view's extents.
  */
  modelExtents: Array<Array<number>>;
}

/**
 * Saved view Itwin sheet view interface.
 */
export interface ItwinSheetViewInterface {
  /**
     * Base model Id
     */
  baseModelId: string;

  /**
   * Origin. (Array of numbers representing x and y)
   */
  origin: XYProps;

  /**
   * Delta. (Array of numbers representing x and y)
   */
  delta: XYProps;

  /**
   * Angle, in degrees.
   */
  angle: number;

  /**
   * The categories of the view.
   */
  categories?: ItwinVisibilityListInterface;

  /**
   * Width of the sheet, in meters.
   */
  width?: number;

  /**
   * Height of the sheet, in meters.
   */
  height?: number;

  /**
   * Scale of the sheet.
   */
  scale?: number;

  /**
   * Sheet template Id
   */
  sheetTemplate?: string;

  /**
   * List of Ids
   */
  sheetAttachments?: Array<string>;
}

/**
 * Itwin Saved view visibility list interface.
 */
export interface ItwinVisibilityListInterface {
  /**
  * List of Ids that should be enabled/visible.
  */
  enabled?: Array<string>;

  /**
   * List of Ids that should be disabled/hidden.
   */
  disabled?: Array<string>;
}

/**
 * Saved view link interface for hyperlink references.
 */
export interface LinkInterface {
  /**
   * Hyperlink reference.
   */
  href: string;
}

/**
 * Saved view interface.
 */
export interface SavedViewDetailInterface {
  /**
   * Unique identifier of saved view.
   */
  id: string;

  /**
   * Display name of saved view.
   */
  displayName: string;

  /**
   * Flag for whether or not saved view is shared.
   */
  shared: boolean;

  /**
   * Saved View Data as Canonical form of View State.
   */
  savedViewData: SavedViewItwinViewInterface;

  /**
   * Tags of Saved View
   */
  tags?: Array<TagInterface>;

  /**
   * Reference link to related saved view resources.
   */
  _links: SavedViewLinkInterface;
}

/**
 * Saved view response interface for get saved view by ID.
 */
export interface SavedViewDetailResponseInterface {
  /**
   * Saved view interface.
   */
  savedView: SavedViewDetailInterface;
}

/**
 * Saved view Itwin 3D view interface.
 */
export interface SavedViewItwin3dViewInterface {
  /**
   * The lower left back corner of the view frustum. (Array of numbers representing x, y and z)
   */
  origin: XYZProps;

  /**
   * The extent of the view frustum. (Array of numbers representing x, y and z)
   */
  extents: XYZProps;

  /**
   * The angles of the view yaw pitch roll.
   */
  angles?: YawPitchRollProps;

  /**
   * The camera of the view.
   */
  camera?: CameraProps;

  /**
   *The categories of the view
   */
  categories?: ItwinVisibilityListInterface;

  /**
   *The models of the view.
   */
  models?: ItwinVisibilityListInterface;
}

/**
 * Saved view Itwin view interface.
 */
export interface SavedViewItwinViewInterface {
  /**
   * Itwin 3D view interface.
   */
  itwin3dView?: SavedViewItwin3dViewInterface;

  /**
   * Itwin sheet view interface.
   */
  itwinSheetView?: ItwinSheetViewInterface;

  /**
  * Itwin drawing view interface.
  */
  itwinDrawingView?: ItwinDrawingViewInterface;
}

/**
 * Saved view response link interface for other related resources reference.
 */
export interface SavedViewLinkInterface {
  /**
   * Hyperlink reference to iTwin.
   */
  iTwin: LinkInterface;

  /**
   *Hyperlink reference to imodel.
   */
  imodel?: LinkInterface;

  /**
   *Hyperlink reference to creator.
   */
  creator: LinkInterface;

  /**
   *Hyperlink reference to group.
   */
  group?: LinkInterface;

  /**
   *Hyperlink reference to image.
   */
  image: LinkInterface;

  /**
   *Hyperlink reference to thumbnail.
   */
  thumbnail: LinkInterface;
}

/**
 * Saved view response interface for get all saved views
 */
export interface SavedViewResponseInterface {
  /**
   * Unique identifier of saved view.
   */
  id: string;

  /**
   * Display name of saved view.
   */
  displayName: string;

  /**
   * Flag for whether or not saved view is shared.
   */
  shared: boolean;

  /**
   * Tags of Saved View
   */
  tags?: Array<TagInterface>;

  /**
   * Reference link to related saved view resources.
   */
  _links: SavedViewLinkInterface;
}

/**
 * Saved view response list interface for get all saved view.
 */
export interface SavedViewsResponseInterface {
  /**
   * List of saved views.
   */
  savedViews: SavedViewResponseInterface[];

  /**
   * Reference link to self saved views reference.
   */
  _links: SelfLinkInterface;
}

/**
 * Saved view self link interface for self reference.
 */
export interface SelfLinkInterface {
  /**
   * Hyperlink reference to self.
   */
  self: LinkInterface;
}

/**
 * Saved view tags interface.
 */
export interface TagInterface {
  /**
   * Unique Tag identifier.
   */
  id: string;

  /**
   * Tag display name.
   */
  displayName: string;
}
