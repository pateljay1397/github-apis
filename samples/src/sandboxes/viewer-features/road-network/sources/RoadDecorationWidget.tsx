/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { useEffect, useRef, useState } from "react";
import {
  AbstractWidgetProps,
  SpecialKey,
  StagePanelLocation,
  StagePanelSection,
  UiItemsProvider,
  WidgetState
} from "@itwin/appui-abstract";
import {
  Alert,
  Button,
  DropdownButton,
  IconButton,
  Input,
  Label,
  MenuItem,
  Tag,
  TagContainer,
  Text,
  toaster,
  ToggleSwitch,
  Tooltip
} from "@itwin/itwinui-react";
import { useActiveViewport } from "@itwin/appui-react";
import { LoadingSpinner } from "@itwin/core-react";
import { SvgHelpCircularHollow } from "@itwin/itwinui-icons-react";
import { Viewport } from "@itwin/core-frontend";
import { HighwayTag, OverpassApi } from "./common/open-street-map/OverpassApi";
import RoadDecorationApi from "./RoadDecorationApi";
import { debounce } from "ts-debounce";
import "./RoadDecoration.scss";

enum HighwayGroup {
  MajorHighways = "Major Highways",
  MajorStreets = "Major Streets",
  Residential = "Residential",
  Unclassified = "Unclassified",
}

/** Maps a highway group to an array of highway tags */
const highwayTagGroup: Record<HighwayGroup, HighwayTag[]> = {
  [HighwayGroup.MajorHighways]:
    [
      HighwayTag.motorway,
      HighwayTag.trunk,
      HighwayTag.motorway_link,
      HighwayTag.trunk_link,
    ],

  [HighwayGroup.MajorStreets]:
    [
      HighwayTag.primary,
      HighwayTag.secondary,
      HighwayTag.tertiary,
      HighwayTag.primary_link,
      HighwayTag.secondary_link,
      HighwayTag.tertiary_link,
    ],
  [HighwayGroup.Residential]:
    [HighwayTag.residential, HighwayTag.living_street],
  [HighwayGroup.Unclassified]:
    [HighwayTag.unclassified],
};

/** Returns an array of highway depending on the size of the viewport */
const getHighwayGroupsFromViewport = (extentMagnitude: number, max: number): HighwayGroup[] => {
  const filters = [HighwayGroup.MajorHighways, HighwayGroup.MajorStreets, HighwayGroup.Residential, HighwayGroup.Unclassified];
  const step = max / filters.length;

  let magnitude = extentMagnitude;
  let priority = filters.length;
  while (magnitude > step && priority > 0) {
    priority--;
    magnitude -= step;
  }

  return filters.slice(0, priority);
};

interface DisabledTooltipProps {
  show: boolean;
  content: React.ReactNode;
  children: JSX.Element;
}

const DisabledTooltip = (props: DisabledTooltipProps) => {
  const childRef = useRef(null);
  return <>
    <div ref={childRef}>
      {props.children}
    </div>
    {props.show && <Tooltip content={props.content} reference={childRef} />}
  </>;
};

const RoadDecorationWidget = () => {
  const viewport = useActiveViewport();

  /** True when performing API query */
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /** Place name to which to travel. */
  const [destination, setDestination] = useState<string>("");
  const [extents, setExtents] = useState<number>();

  /** True when creating streets and intersections without performing an API query  */
  const [isCreatingRoads, setIsCreatingRoads] = useState<boolean>(false);

  /** Decorator settings */
  const [showIntersections, setShowIntersections] = useState<boolean>(true);
  const [canShowIntersections, setCanShowIntersections] = useState<boolean>(true);
  const [showDebugPoints, setDebugPoints] = useState<boolean>(false);
  const [streetsOnlyMap, setStreetsOnlyMap] = useState<boolean>(true);

  /** Defaulting roads to be created for driving on the right side of the road */
  const leftSide = false;

  /** Streets will only be created for streets with highway tags that are members of the following highway groups */
  const [filters, setFilters] = useState<HighwayGroup[]>(Object.values(HighwayGroup));
  const [availableFilters, setAvailableFilters] = useState<HighwayGroup[]>([]);

  const addFilter = (filterLabel: HighwayGroup, close: () => void) => {
    // Remove filter from the list of filters in the dropdown
    setAvailableFilters(availableFilters.filter((_filter) => _filter !== filterLabel));

    // Add filter to the list of active filters
    setFilters([...filters, filterLabel]);

    // Close the dropdown
    close();
  };

  const removeFilter = (filterLabel: HighwayGroup) => {
    // Remove filter from active filters
    setFilters(filters.filter((_filter) => _filter !== filterLabel));

    // Add filter to the list of filters in the dropdown
    setAvailableFilters([...availableFilters, filterLabel]);
  };

  /** Returns an array of MenuItems for each available filter, used by the Add Filter dropdown button */
  const buttonMenuItems = (close: () => void) =>
    availableFilters.map((filter) => (
      <MenuItem key={filter} onClick={() => addFilter(filter, close)}>
        {filter}
      </MenuItem>
    ));

  /** Initialize OSM data and decorators on viewport change */
  useEffect(() => {
    handleSetViewBounds();
    if (viewport) setExtents(RoadDecorationApi.getExtents(viewport));

    const disposeViewChangedListener = viewport?.onViewChanged.addListener(
      (vp: Viewport) => {
        void debounce(() => setExtents(RoadDecorationApi.getExtents(vp)))();
      }
    );

    return () => {
      RoadDecorationApi.dispose();
      if (disposeViewChangedListener) disposeViewChangedListener();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewport]);

  /** Recreate the streets using existing data whenever leftSide or filterOption change */
  useEffect(() => {
    const tags = getFilterGroups(filters);
    setIsCreatingRoads(true);

    OverpassApi.updateStreetsAndIntersections(
      leftSide,
      tags ?? Object.values(HighwayTag)
    )
      .then((data) => {
        if (data)
          RoadDecorationApi.createDecorator(
            data,
            canShowIntersections && showIntersections,
            showDebugPoints
          );
      })
      .finally(() => setIsCreatingRoads(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, canShowIntersections, showIntersections]);

  useEffect(() => {
    if (!extents) return;

    setCanShowIntersections(extents < RoadDecorationApi.maxQueryDistance / 5);

    const groups = getHighwayGroupsFromViewport(extents, RoadDecorationApi.maxQueryDistance);

    if (groups.length === 0) {
      groups.push(HighwayGroup.MajorHighways);
    }
    if (groups.length < filters.length + availableFilters.length) {
      setFilters(filters.filter((filter) => groups.includes(filter)));
      setAvailableFilters(
        availableFilters.filter((filter) => groups.includes(filter))
      );
    } else if (groups.length > filters.length + availableFilters.length) {
      const newGroups = groups.filter(
        (group) => !availableFilters.includes(group)
      );
      setFilters(newGroups);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extents]);

  useEffect(() => {
    RoadDecorationApi.getRoadDecorators().forEach((decorator) => {
      decorator.showDebugPoints(showDebugPoints);
      viewport?.invalidateCachedDecorations(decorator);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDebugPoints]);

  useEffect(() => {
    if (viewport) RoadDecorationApi.setMap(viewport, streetsOnlyMap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streetsOnlyMap]);

  /** Returns a group of all the highway tags associated with the groups passed in */
  const getFilterGroups = (groups: HighwayGroup[]): HighwayTag[] => {
    const tags: HighwayTag[] = [];
    groups.forEach((group) =>
      tags.push(...highwayTagGroup[group])
    );
    return tags;
  };

  /** Creates streets/intersections from a new OSM query */
  const handleSetViewBounds = () => {
    if (undefined === viewport) return;

    const viewportExtents: number = RoadDecorationApi.getExtents(viewport);

    if (viewportExtents > RoadDecorationApi.maxQueryDistance) {
      toaster.informational(`Zoom in to view data`, {
        hasCloseButton: true,
        type: "temporary",
      });
      return;
    }

    const queryGroups = getFilterGroups([...filters, ...availableFilters]);
    const tags = getFilterGroups(filters);
    setIsLoading(true);
    OverpassApi.createStreetsAndIntersections(
      leftSide,
      viewport,
      tags ?? Object.values(HighwayTag),
      queryGroups
    )
      .then((data) => {
        if (data)
          RoadDecorationApi.createDecorator(
            data,
            showIntersections && canShowIntersections,
            showDebugPoints
          );
      })
      .catch((error: any) => {
        toaster.warning(`Error fetching data: ${error}`, {
          hasCloseButton: true,
          type: "temporary",
        });
      })
      .finally(() => setIsLoading(false));
  };

  /** Uses the RoadDecorationApi to move the viewport to a specific location depending on the value of 'destination' */
  const handleTravel = async () => {
    if (!viewport) return;

    const locationFound = await RoadDecorationApi.travelTo(
      viewport,
      destination
    );
    if (locationFound) {
      handleSetViewBounds();
    } else {
      const message = `Sorry, "${destination}" isn't recognized as a location.`;
      toaster.warning(message, {
        hasCloseButton: true,
        type: "temporary",
      });
    }
  };

  /** Handles enter/return key button presses in destination input boxes */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === SpecialKey.Enter || e.key === SpecialKey.Return) {
      handleTravel().catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
      });
    }
  };

  const updateButtonDisabled = isLoading ||
    isCreatingRoads ||
    !extents ||
    extents > RoadDecorationApi.maxQueryDistance;

  const widgetRef = useRef(null);

  return (
    <div className="sample-options">
      <div className="sample-grid" ref={widgetRef}>
        <DisabledTooltip show={!extents ||
          extents > RoadDecorationApi.maxQueryDistance} content="Zoom in to enable">
          <Button
            onClick={handleSetViewBounds}
            disabled={updateButtonDisabled}
            style={{ width: "100%" }}
          >
            {isLoading || isCreatingRoads ? <LoadingSpinner /> : "Update Street Data"}
          </Button>
        </DisabledTooltip>
        <ToggleSwitch
          label="Streets only map"
          checked={streetsOnlyMap}
          onChange={(event) => setStreetsOnlyMap(event.target.checked)}
        />
        <DisabledTooltip show={!canShowIntersections} content="Zoom in to view intersections">
          <ToggleSwitch
            label="Intersections"
            checked={showIntersections && canShowIntersections}
            onChange={(event) => setShowIntersections(event.target.checked)}
            disabled={!canShowIntersections || isLoading || isCreatingRoads}
          />
        </DisabledTooltip>
        <ToggleSwitch
          label="Debug points"
          checked={showDebugPoints}
          disabled={isLoading || isCreatingRoads}
          onChange={(event) => setDebugPoints(event.target.checked)}
        />
        <DisabledTooltip show={availableFilters.length === 0} content="All available filters enabled">
          <DropdownButton
            menuItems={buttonMenuItems}
            disabled={availableFilters.length === 0}
            style={{ width: "100%" }}
          >
            Add filter
          </DropdownButton>
        </DisabledTooltip>
        <div className="sample-tag-container">
          <Tooltip content="Available filters depend on the current zoom level and restrict the data requested from OpenStreetMap">
            <IconButton
              size="small"
              styleType="borderless"
              style={{ marginRight: "16px" }}
            >
              <SvgHelpCircularHollow />
            </IconButton>
          </Tooltip>

          <TagContainer className="sample-tag-container1">
            {filters.map((filter) => (
              <Tag
                key={filter}
                onRemove={() => {
                  removeFilter(filter);
                }}
              >
                {filter}
              </Tag>
            ))}
          </TagContainer>
        </div>
        <div className="travel-destination">
          <Label htmlFor="destination">
            <span className="toggle-label">
              <Text>Destination</Text>
              <Tooltip content="Type a place name and press enter to travel there">
                <IconButton
                  size="small"
                  styleType="borderless"
                >
                  <SvgHelpCircularHollow />
                </IconButton>
              </Tooltip>
            </span>
          </Label>
          <Input
            id="destination"
            size="small"
            className="travel-destination-input"
            onChange={(e) => setDestination(e.currentTarget.value)}
            onKeyPress={handleKeyPress}
          />
          <Button
            size="small"
            className="travel-destination-btn"
            styleType="cta"
            disabled={!destination.length}
            onClick={handleTravel}
          >
            Travel
          </Button>
        </div>
        {(isLoading || isCreatingRoads) && <Tooltip content="Loading Data" reference={widgetRef} />}
        <Alert type="informational" className="instructions">
          Zoom in and out to view street data at varying degrees of detail, and use
          the controls above to change the street decorator's settings. Hover over a
          street to view its details. Clicking the update button resets the OSM data
          according to the view extents.
        </Alert>
      </div>
    </div>
  );
};

export class RoadDecorationWidgetProvider implements UiItemsProvider {
  public readonly id: string = "RoadDecorationWidgetProvider";

  public provideWidgets(
    _stageId: string,
    _stageUsage: string,
    location: StagePanelLocation,
    _section?: StagePanelSection
  ): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Bottom) {
      widgets.push({
        id: "RoadDecorationWidget",
        label: "Road Network Decorator",
        defaultState: WidgetState.Open,
        // eslint-disable-next-line react/display-name
        getWidgetContent: () => <RoadDecorationWidget />,
      });
    }
    return widgets;
  }
}
