/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useCallback, useEffect, useMemo } from "react";
import { Column } from "react-table";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { useActiveIModelConnection, useActiveViewport } from "@itwin/appui-react";
import { ColorDef } from "@itwin/core-common";
import { ColorPickerButton } from "@itwin/imodel-components-react";
import { Alert, Button, InputGroup, LabeledSelect, Table, Text, ToggleSwitch } from "@itwin/itwinui-react";
import { ElementPosition, SectionOfColoring, SpatialElement, VolumeQueryApi } from "./VolumeQueryApi";
import "./VolumeQuery.scss";

const columns: Column<SpatialElement>[] = [
  {
    Header: "Table",
    columns: [
      { Header: "Element Id", accessor: "id", maxWidth: 130 },
      { Header: "Name", accessor: "name" },
    ],
  },
];

const VolumeQueryWidget = () => {
  const viewport = useActiveViewport();
  const iModelConnection = useActiveIModelConnection();
  const [volumeBoxState, setVolumeBoxState] = React.useState<boolean>(true);
  const [clipVolumeState, setClipVolumeState] = React.useState<boolean>(false);
  const [coloredElements, setColoredElements] = React.useState<Record<ElementPosition, number>>({
    [ElementPosition.InsideTheBox]: 0,
    [ElementPosition.Overlap]: 0,
  });
  const [classifiedElementsColors, setClassifiedElementsColors] = React.useState<Record<SectionOfColoring, ColorDef>>({
    [SectionOfColoring.InsideTheBox]: ColorDef.green,
    [SectionOfColoring.Overlap]: ColorDef.blue,
    [SectionOfColoring.OutsideTheBox]: ColorDef.red,
  });
  const [elementsToShow, setElementsToShow] = React.useState<Record<ElementPosition, SpatialElement[]>>({
    [ElementPosition.InsideTheBox]: [],
    [ElementPosition.Overlap]: [],
  });
  const [selectedPosition, setSelectedPosition] = React.useState<ElementPosition>(ElementPosition.InsideTheBox);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  /* Turning Volume Box on and off */
  useEffect(() => {
    if (!viewport)
      return;

    if (volumeBoxState) {
      if (!viewport.view.getViewClip()) {
        VolumeQueryApi.clearColorOverrides(viewport);
        VolumeQueryApi.addBoxRange(viewport);
        setElementsToShow({ [ElementPosition.InsideTheBox]: [], [ElementPosition.Overlap]: [] });
      }
    } else {
      VolumeQueryApi.clearClips(viewport);
      setClipVolumeState(false);
    }
  }, [viewport, volumeBoxState]);

  /* Turning Clip Volume feature on and off */
  useEffect(() => {
    if (viewport) {
      const range = VolumeQueryApi.computeClipRange(viewport);
      if (clipVolumeState) {
        VolumeQueryApi.addBoxRange(viewport, range, true);
      } else {
        VolumeQueryApi.addBoxRange(viewport, range, false);
      }
    }
  }, [clipVolumeState, viewport]);

  /* Coloring elements that are inside, outside the box or overlapping */
  const applyColorOverrides = useCallback(async () => {
    if (viewport && iModelConnection) {
      setIsLoading(true);
      /* Clearing colors so they don't stack when pressing apply button multiple times */
      VolumeQueryApi.clearColorOverrides(viewport);
      setColoredElements({ [ElementPosition.InsideTheBox]: 0, [ElementPosition.Overlap]: 0 });
      setElementsToShow({ [ElementPosition.InsideTheBox]: [], [ElementPosition.Overlap]: [] });
      let internal: SpatialElement[] = [];
      let overlapping: SpatialElement[] = [];

      /* Getting elements that are going to be colored */
      const range = VolumeQueryApi.computeClipRange(viewport);
      const spatialElements = await VolumeQueryApi.getSpatialElements(iModelConnection, range);
      let classifiedElements: Record<ElementPosition, SpatialElement[]> | undefined;

      /* Break up the potential large array into smaller arrays with a maximum of 6 000 keys each.
      For example, if there are 18 000 spatial elements, this will create 3 arrays with 6 000 keys each.
      This is being done because API has a limit for how many ids you can send at once */
      const packsOfIds = Math.floor(spatialElements.length / 6000);
      for (let i = 0; i <= packsOfIds; i++) {
        /* Classifying elements */
        if (i !== packsOfIds) {
          classifiedElements = await VolumeQueryApi.getClassifiedElements(viewport, iModelConnection, spatialElements.slice(i * 6000, (i + 1) * 6000));
        } else {
          classifiedElements = await VolumeQueryApi.getClassifiedElements(viewport, iModelConnection, spatialElements.slice(i * 6000, spatialElements.length + 1));
        }

        /* Coloring classified elements */
        if (classifiedElements !== undefined) {
          await VolumeQueryApi.colorClassifiedElements(viewport, classifiedElements, classifiedElementsColors);
          internal = internal.concat(classifiedElements.Inside);
          overlapping = overlapping.concat(classifiedElements.Overlap);
        }
      }

      elementsToShow[ElementPosition.InsideTheBox] = await VolumeQueryApi.getSpatialElementsWithName(viewport, internal.slice(0, 99));
      elementsToShow[ElementPosition.Overlap] = await VolumeQueryApi.getSpatialElementsWithName(viewport, overlapping.slice(0, 99));
      setColoredElements({ [ElementPosition.InsideTheBox]: internal.length, [ElementPosition.Overlap]: overlapping.length });
      setElementsToShow(elementsToShow);
      setIsLoading(false);
    }

  }, [classifiedElementsColors, elementsToShow, iModelConnection, viewport]);

  /** Start applying color overrides on load */
  useEffect(() => {
    applyColorOverrides().catch((error) => console.error(error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearColorOverrides = () => {
    if (viewport) {
      VolumeQueryApi.clearColorOverrides(viewport);
      /* Emptying elements to show list and Colored Elements list */
      setElementsToShow({ [ElementPosition.InsideTheBox]: [], [ElementPosition.Overlap]: [] });
      setColoredElements({ [ElementPosition.InsideTheBox]: 0, [ElementPosition.Overlap]: 0 });
    }
  };

  /* Changing colors of elements that are going to be overridden */
  const onColorPick = (colorValue: ColorDef, position: SectionOfColoring) => {
    const previousColors = classifiedElementsColors;
    previousColors[position] = colorValue;
    setClassifiedElementsColors(previousColors);
  };

  const elementDisplayOptions = [
    { value: ElementPosition.InsideTheBox, label: "Inside of volume box" },
    { value: ElementPosition.Overlap, label: "Overlapping the volume box" },
  ];

  const resolvedElements: SpatialElement[] = useMemo(() => {
    return elementsToShow[selectedPosition].map((element) => ({ id: element.id, className: element.className, name: element.name }));
  }, [elementsToShow, selectedPosition]);

  return (
    <div className="sample-options">
      <div className="sample-grid">
        <div className="elements-grid">
          <LabeledSelect
            label="Display elements:"
            displayStyle="inline"
            size="small"
            className="elements-grid-a"
            value={selectedPosition}
            onChange={setSelectedPosition}
            options={elementDisplayOptions} />
          {coloredElements[selectedPosition] > 0 && <Text isMuted={true} className="elements-grid-c">
            Found {coloredElements[selectedPosition]} elements
            {(coloredElements[selectedPosition] <= 100) ? "." : ", showing the first 100."}
          </Text>}
          <Table
            density="extra-condensed"
            data={resolvedElements}
            columns={columns}
            isLoading={isLoading}
            emptyTableContent="No matching elements"
            className="elements-grid-b" />
        </div>
        <div className="controls-grid">
          <ToggleSwitch label="Show Volume Box" checked={volumeBoxState} onChange={() => setVolumeBoxState((state) => !state)} disabled={isLoading} />
          <ToggleSwitch label="Clip Volume" checked={clipVolumeState} onChange={() => setClipVolumeState((state) => !state)} disabled={isLoading || !volumeBoxState} />
          <InputGroup label="Coloring for elements:">
            <div className="color-picker">
              <ColorPickerButton initialColor={classifiedElementsColors.Inside} onColorPick={(color) => onColorPick(color, SectionOfColoring.InsideTheBox)} />
              <Text>Inside</Text>
            </div>
            <div className="color-picker">
              <ColorPickerButton initialColor={classifiedElementsColors.Outside} onColorPick={(color) => onColorPick(color, SectionOfColoring.OutsideTheBox)} />
              <Text>Outside</Text>
            </div>
            <div className="color-picker">
              <ColorPickerButton initialColor={classifiedElementsColors.Overlap} onColorPick={(color) => onColorPick(color, SectionOfColoring.Overlap)} />
              <Text>Overlapping</Text>
            </div>
          </InputGroup>
          <InputGroup displayStyle="inline">
            <Button styleType="high-visibility" className="control-button" disabled={!volumeBoxState || isLoading} onClick={applyColorOverrides}>Apply</Button>
            <Button styleType="high-visibility" className="control-button" disabled={isLoading} onClick={clearColorOverrides}>Clear</Button>
          </InputGroup>
        </div>
        <Alert type="informational" className="instructions">
          Use the controls to query and color spatial elements in the iModel using a volume box
        </Alert>
      </div>
    </div>
  );
};

export class VolumeQueryWidgetProvider implements UiItemsProvider {
  public readonly id: string = "VolumeQueryWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Bottom) {
      widgets.push(
        {
          id: "VolumeQueryWidget",
          label: "Volume Query Selector",
          defaultState: WidgetState.Open,
          getWidgetContent: () => <VolumeQueryWidget />,
        }
      );
    }
    return widgets;
  }
}
