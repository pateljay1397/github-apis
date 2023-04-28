/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useCallback, useEffect, useState } from "react";
import {
  AbstractWidgetProps,
  StagePanelLocation,
  StagePanelSection,
  UiItemsProvider,
  WidgetState
} from "@itwin/appui-abstract";
import { useActiveIModelConnection } from "@itwin/appui-react";
import SavedViewsApi from "./SavedViewsApi";
import { Alert, ProgressRadial, Tag, TagContainer, Tile } from "@itwin/itwinui-react";
import { SvgTag } from "@itwin/itwinui-icons-react";
import { IModelApp } from "@itwin/core-frontend";
import { SavedViewItwinJsViewStateParser } from "./SavedViewItwinJsViewStateParser";
import { GroupResponseInterface, LinkInterface, SavedViewResponseInterface, TagInterface } from "./SavedViewsInterfaces";
import "./SavedViews.scss";

/**
 * Saved views tile component.
 * @param props name of the saved views tile properties.
 * @returns SavedViewsTile
 */
const SavedViewsTile = (props: {
  onSavedViewTileClick: (savedViewId: string) => Promise<void>;
  savedView: SavedViewResponseInterface;
  selectedId?: string;
  thumbnail: string;
}) => {
  const { onSavedViewTileClick, savedView, selectedId, thumbnail } = props;
  const [savedViewclicked, setSavedViewClicked] = useState<boolean>(false);

  /**
   * Saved view Tile Div click handler.
   */
  const handleKeyDown = async () => {
    setSavedViewClicked(true);
    await onSavedViewTileClick(savedView.id);
  };

  useEffect(() => {
    if (selectedId === savedView.id) {
      setSavedViewClicked(false);
    }
  }, [selectedId, savedView.id]);

  return (
    <div onClick={handleKeyDown} onKeyDown={handleKeyDown}
      role="button" tabIndex={0} className="saved-views-tile-div" >
      <Tile
        name={savedView.displayName}
        isSelected={selectedId === savedView.id}
        className="saved-views-tile"
        thumbnail={thumbnail}
        metadata={
          <>
            {savedView.tags && savedView.tags.length > 0 ? <SvgTag /> : undefined}
            <TagContainer overflow="truncate">
              {savedView.tags?.map((t: TagInterface) => (<Tag key={t.id} variant="basic">
                {t.displayName}
              </Tag>))}
            </TagContainer></>
        }
        variant="default"
        // eslint-disable-next-line react/no-children-prop
        children={savedViewclicked ? <ProgressRadial size="small" indeterminate={true} /> : undefined}
      />
    </div>);
};

/**
 * Saved Views Tile List
 * @param props name of the SavedViewsTileList props.
 * @returns SavedViewsTileList
 */
const SavedViewsTileList = (props: {
  onSavedViewTileClick: (savedViewId: string) => Promise<void>;
  savedViews: SavedViewResponseInterface[];
  selectedId?: string;
  thumbnails: Record<string, string>;
}) => {
  const { onSavedViewTileClick, savedViews, selectedId, thumbnails } = props;

  return (<>
    {
      savedViews?.map((sv) => (
        <SavedViewsTile
          key={sv.id}
          savedView={sv}
          onSavedViewTileClick={onSavedViewTileClick}
          thumbnail={thumbnails[sv.id]}
          selectedId={selectedId} />))
    }
  </>);
};

/**
 * Saved Views Widget.
 * @returns SavedViewsWidget
 */
const SavedViewsWidget = () => {
  const iModelConnection = useActiveIModelConnection();
  const [savedViews, setSavedViews] = useState<SavedViewResponseInterface[]>([]);
  const [groups, setGroups] = useState<GroupResponseInterface[]>([]);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [groupedSavedViews, setGroupedSavedViews] = useState<Record<string, SavedViewResponseInterface[]>>({});
  const [selectedSavedViewId, setSelectedSavedViewId] = useState<string | undefined>();
  const ungroupedGroupName = "Ungrouped";

  /**
   * Get all the savedViews by iTwinId and iModelId.
   */
  const getSavedViews = useCallback(
    () => {
      if (iModelConnection && iModelConnection.iTwinId) {
        SavedViewsApi.getAllAsync(iModelConnection.iTwinId, iModelConnection.iModelId)
          .then((sv) => setSavedViews(sv.savedViews))
          .catch((error) => console.error(error));
      }
    },
    [iModelConnection]
  );

  useEffect(() => {
    getSavedViews();
  }, [getSavedViews]);

  /**
   * Get all the groups by iTwinId and iModelId.
   */
  const getGroups = useCallback(
    () => {
      if (iModelConnection && iModelConnection.iTwinId) {
        SavedViewsApi.getAllGroupsAsync(iModelConnection.iTwinId, iModelConnection.iModelId)
          .then((grp) => setGroups(grp.groups))
          .catch((error) => console.error(error));
      }
    },
    [iModelConnection]
  );

  useEffect(() => {
    getGroups();
  }, [getGroups]);

  /**
   * Gets thumbnail urls for each savedViews.
   */
  const getThumbnailUrls = useCallback(
    () => {
      savedViews?.forEach((savedViewsResponse: SavedViewResponseInterface) => {
        SavedViewsApi.getThumbnailUrlAsync(savedViewsResponse._links.thumbnail.href)
          .then((thumbnailResponse: LinkInterface | undefined) => {
            setThumbnails((thumbnail) => ({
              ...thumbnail,
              [savedViewsResponse.id]: thumbnailResponse?.href ?? `${savedViewsResponse.displayName.replace(/\s/g, "_")}.png`,
            }));
          })
          .catch((error) => console.error(error));
      });
    },
    [savedViews]
  );

  useEffect(() => {
    getThumbnailUrls();
  }, [getThumbnailUrls]);

  /**
   * Apply the view change for given saved view Id.
   * @param savedViewId name of the saved view Id.
   */
  const applyViewChange = async (savedViewId: string): Promise<void> => {
    try {
      const savedViewResponse = await SavedViewsApi.getByIdAsync(savedViewId);
      const viewPort = IModelApp.viewManager.selectedView;
      if (viewPort) {
        const savedView3d = savedViewResponse.savedView.savedViewData?.itwin3dView;
        if (savedView3d) {
          const viewStateFromSavedView = await SavedViewItwinJsViewStateParser.toItwinJsViewState(savedView3d, viewPort);
          viewPort.changeView(viewStateFromSavedView, { animateFrustumChange: true });
        }
        setSelectedSavedViewId(savedViewId);
      }
    } catch (error) {
      alert("Error on applying saved view, please check console for more info.");
      console.error(error);
    }
  };

  /**
   * Group saved views list per the group.
   */
  const groupSavedViewsByGroupLink = useCallback(
    () => {
      const grpdSavedViews = savedViews.reduce((reducedSavedView: Record<string, SavedViewResponseInterface[]>, savedView: SavedViewResponseInterface) => {
        const groupHref = savedView?._links?.group?.href;
        if (groupHref) {
          const groupId = groupHref.split("/").pop() ?? ungroupedGroupName;
          (reducedSavedView[groupId] = reducedSavedView[groupId] || []).push(savedView);
        } else {
          (reducedSavedView[ungroupedGroupName] = reducedSavedView[ungroupedGroupName] || []).push(savedView);
        }
        return reducedSavedView;
      }, {});
      setGroupedSavedViews(grpdSavedViews);
    },
    [savedViews]
  );

  useEffect(() => {
    groupSavedViewsByGroupLink();
  }, [groupSavedViewsByGroupLink]);

  return (
    <div className="saved-views-wrapper">
      <div className="saved-views-banner">
        <Alert type="informational">
          Click on the thumbnails to apply saved views to the viewer.
        </Alert>
      </div>
      {groupedSavedViews ? <div className="saved-views-tile-list">
        <div key={ungroupedGroupName}><h3 className={"saved-views-group"}>{ungroupedGroupName}</h3>
          <SavedViewsTileList
            onSavedViewTileClick={applyViewChange}
            thumbnails={thumbnails}
            savedViews={groupedSavedViews[ungroupedGroupName]}
            selectedId={selectedSavedViewId}
          /></div>
        {groups ? groups.map((grp) => {
          return (<div key={grp.id}>
            <h3 className={"saved-views-group"}>{grp.displayName}</h3>
            <SavedViewsTileList
              onSavedViewTileClick={applyViewChange}
              thumbnails={thumbnails}
              savedViews={groupedSavedViews[grp.id]}
              selectedId={selectedSavedViewId}
            />
          </div>);
        }) : undefined}
      </div> : undefined}
    </div>
  );
};

/**
 * Saved Views Widget Provider.
 */
export class SavedViewsWidgetProvider implements UiItemsProvider {
  public readonly id: string = "SavedViewsWidgetProvider";

  public provideWidgets(
    _stageId: string,
    _stageUsage: string,
    location: StagePanelLocation,
    _section?: StagePanelSection
  ): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (
      location === StagePanelLocation.Right &&
      _section === StagePanelSection.Start
    ) {
      widgets.push({
        id: "SavedViewsWidget",
        label: "Saved Views",
        defaultState: WidgetState.Open,
        getWidgetContent: () => <SavedViewsWidget />,
      });
    }
    return widgets;
  }
}
