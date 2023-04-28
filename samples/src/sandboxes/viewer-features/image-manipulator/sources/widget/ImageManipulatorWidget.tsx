/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { IModelApp } from "@itwin/core-frontend";
import { Button, Slider } from "@itwin/itwinui-react";
import React from "react";
import { ImageManipulatorApi } from "../ImageManipulatorApi";

import "./ImageManipulatorWidget.scss";

const BUTTON_COUNT = 2;

export const ImageManipulatorWidget = () => {
  /** State variable for alpha that slider changes */
  const [imageOpacity, setImageAlpha] = React.useState<number>(70);

  /** Build up the "button container" that holds the buttons to switch images */
  const getButtons = () => {
    const rowData: JSX.Element[] = [];
    for (let i = 0; i < BUTTON_COUNT; i++) {
      rowData.push(
        <Button onClick={()=>{handleTextureChange(i);}}>
          Image {i+1}
        </Button>
      );
    }
    return rowData;
  };

  /** Handler for opacity slider change */
  const changeAlpha = (newAlpha: number) => {
    setImageAlpha(newAlpha);
    ImageManipulatorApi.setImageAlpha(newAlpha/100);
    IModelApp.viewManager.invalidateDecorationsAllViews();
  };

  /** Handles a click on on of the buttons to change the texture */
  const handleTextureChange = (i: number) => {
    ImageManipulatorApi.changeTextureIndexAndPlacement(i);
    ImageManipulatorApi.lookAtImage();
    IModelApp.viewManager.invalidateDecorationsAllViews();
  };

  return (
    <div className="sample-options">
      <div className="pad">
        <label>Opacity</label>
        <Slider
          style={{ width: "100%" }}
          minLabel={"0"}
          maxLabel={"100"}
          min={0}
          max={100}
          trackDisplayMode="auto"
          onUpdate={(event)=>{changeAlpha(event[0]);}}
          values={[
            imageOpacity,
          ]}
        />
      </div>
      <div className="pad">
        <Button onClick={()=>{ImageManipulatorApi.lookAtImage();}}>
          Look At Image
        </Button>
      </div>
      <div className="pad">
        <label>Image Selector</label>
        <div className="buttonContainer">
          {getButtons()}
        </div>
      </div>
    </div>
  );

};

export class SimpleWidgetProvider implements UiItemsProvider {
  public readonly id: string = "Simple3dWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection) {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "Simple3dWidget",
          label: "Image Options",
          defaultState: WidgetState.Open,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <ImageManipulatorWidget />,
        }
      );
    }
    return widgets;
  }
}
