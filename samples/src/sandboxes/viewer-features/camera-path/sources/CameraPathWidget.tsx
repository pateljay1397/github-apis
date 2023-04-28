/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useCallback, useEffect, useRef, useState } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { useActiveViewport } from "@itwin/appui-react";
import { IModelApp } from "@itwin/core-frontend";
import { SvgPause, SvgPlay } from "@itwin/itwinui-icons-react";
import { Alert, IconButton, LabeledSelect, SelectOption, Slider } from "@itwin/itwinui-react";
import CameraPathApi, { CameraPath } from "./CameraPathApi";
import { CameraPathTool } from "./CameraPathTool";
import "./CameraPath.scss";

const speeds: SelectOption<number>[] = [
  { value: 2.23520, label: "5 Mph: Walking" },
  { value: 13.4112, label: "30 Mph: Car" },
  { value: 26.8224, label: "60 Mph: Car" },
  { value: 67.0500, label: "150 Mph: Airplane" },
];

const paths: SelectOption<string>[] = [
  { value: "commuterViewPath", label: "Commuter View" },
  { value: "trainPath", label: "Train Path" },
  { value: "flyoverPath", label: "Fly Over" },
];

const CameraPathWidget = () => {
  const viewport = useActiveViewport();
  const [cameraPath, setCameraPath] = useState<CameraPath>(new CameraPath(paths[0].value));
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(speeds[0].value);

  const keyDown = useRef<boolean>(false);

  /** Initialize the camera namespace on widget load */
  useEffect(() => {
    void IModelApp.localization.registerNamespace("camera-i18n-namespace");
    CameraPathTool.register("camera-i18n-namespace");

    return () => {
      IModelApp.localization.unregisterNamespace("camera-i18n-namespace");
      IModelApp.tools.unRegister(CameraPathTool.toolId);
    };
  }, []);

  const handleUnlockDirection = (isKeyDown: boolean) => {
    keyDown.current = isKeyDown;
  };

  const _handleScrollPath = useCallback(async (eventDeltaY: number) => {
    if (viewport === undefined || cameraPath === undefined)
      return;
    setSliderValue((prevSliderValue) => {
      if (((prevSliderValue === 1) && (eventDeltaY > 0)) || ((prevSliderValue === 0) && (eventDeltaY < 0)))
        return prevSliderValue;

      const stepLength = (cameraPath.getLength() / 10) / 30;
      let cameraPathIterationValue: number = prevSliderValue;

      if (eventDeltaY > 0)
        cameraPathIterationValue += 0.009;
      else
        cameraPathIterationValue -= 0.009;

      // If we go over
      if (cameraPathIterationValue > 1) cameraPathIterationValue = 1;
      if (cameraPathIterationValue < 0) cameraPathIterationValue = 0;

      setIsPaused(true);
      const nextPathFraction = cameraPath.advanceAlongPath(cameraPathIterationValue, stepLength);
      const nextPathPoint = cameraPath.getPathPoint(nextPathFraction);
      CameraPathApi.changeCameraPositionAndTarget(nextPathPoint, viewport, keyDown.current);

      return nextPathFraction;
    });
  }, [viewport, cameraPath, keyDown]);

  const handleScrollAnimation = useCallback((eventDeltaY: number) => {
    setIsPaused(true);
    _handleScrollPath(eventDeltaY)
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
      });
  }, [_handleScrollPath]);

  /** Turn the camera on, and initialize the tool */
  useEffect(() => {
    if (viewport) {
      CameraPathApi.prepareView(viewport);

      // We will use this method to activate the CameraPathTool
      // The CameraPathTool will prevent the view tool and standard mouse events
      setTimeout(() => { void IModelApp.tools.run(CameraPathTool.toolId, handleScrollAnimation, handleUnlockDirection); }, 10);
    }
  }, [handleScrollAnimation, viewport]);

  /** When the slider Value is changed, change the view to reflect the position in the path */
  useEffect(() => {
    if (viewport && cameraPath && isPaused) {
      const nextPathPoint = cameraPath.getPathPoint(sliderValue);
      CameraPathApi.changeCameraPositionAndTarget(nextPathPoint, viewport);
    }
  }, [viewport, sliderValue, cameraPath, isPaused]);

  useEffect(() => {
    let animID: number;
    if (!isPaused && cameraPath && viewport) {
      const animate = (currentPathFraction: number) => {
        if (currentPathFraction < 1) {
          const nextPathFraction = cameraPath.advanceAlongPath(currentPathFraction, speed / 30);
          const nextPathPoint = cameraPath.getPathPoint(nextPathFraction);
          CameraPathApi.changeCameraPositionAndTarget(nextPathPoint, viewport, keyDown.current);
          setSliderValue(nextPathFraction);
          animID = requestAnimationFrame(() => {
            animate(nextPathFraction);
          });
        } else {
          setIsPaused(true);
        }
      };
      animID = requestAnimationFrame(() => animate(sliderValue));
    }
    return () => {
      if (animID) {
        cancelAnimationFrame(animID);
      }
    };
    // This effect should NOT be called when the sliderValue is changed because the animate value sets the slider value. It is only needed on initial call.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraPath, speed, isPaused, viewport]);

  const _onChangeCameraSliderValue = (sliderNumber: number) => {
    setIsPaused(true);
    setSliderValue(sliderNumber);
  };

  // Update the States for the Play / Pause button click event
  const _handleCameraPlay = () => {
    if (sliderValue >= 1) {
      setSliderValue(0);
    }
    setIsPaused(!isPaused);
  };

  // Handle the Path Change
  const _onChangeRenderPath = (pathName: string) => {
    setSliderValue(0);
    setIsPaused(true);
    setCameraPath(new CameraPath(pathName));
  };

  return (
    <div className="sample-options">
      <div className="sample-grid">
        <LabeledSelect label="Path:" size="small" displayStyle="inline" options={paths} value={cameraPath.pathName} onChange={_onChangeRenderPath} onShow={undefined} onHide={undefined} />
        <div className="sample-options-control">
          <LabeledSelect label="Speed:" size="small" displayStyle="inline" options={speeds} value={speed} onChange={setSpeed} onShow={undefined} onHide={undefined} />
          <IconButton size="small" onClick={_handleCameraPlay} >
            {isPaused ? <SvgPlay /> : <SvgPause />}
          </IconButton>
        </div>
        <Slider
          className="sample-options-slider"
          values={[sliderValue]}
          min={0}
          minLabel="Progress Bar:"
          max={1}
          maxLabel=""
          onChange={(values) => _onChangeCameraSliderValue(values[0])}
          step={Math.pow(10, -10)} />
      </div>
      <Alert type="informational" className="instructions">
        Use the mouse wheel to scroll the camera along the predefined path. Click in the view to look around.
      </Alert>
    </div>
  );
};

export class CameraPathWidgetProvider implements UiItemsProvider {
  public readonly id: string = "CameraPathWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Bottom) {
      widgets.push(
        {
          id: "CameraPathWidget",
          label: "Camera Path",
          defaultState: WidgetState.Open,
          getWidgetContent: () => <CameraPathWidget />,
        }
      );
    }
    return widgets;
  }
}
