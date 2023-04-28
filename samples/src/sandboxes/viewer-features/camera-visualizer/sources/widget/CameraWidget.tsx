/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { useEffect } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { IModelApp } from "@itwin/core-frontend";
import { Alert, Button, Slider, Tooltip } from "@itwin/itwinui-react";
import "../camera-visualizer.scss";
import { CameraManager, LENS_ANGLE_MAXIMUM, LENS_ANGLE_MINIMUM } from "../CameraManager";
import { CameraTable } from "./CameraTable";
import { CustomCamera } from "../visuals/CustomCamera";
import { Angle } from "@itwin/core-geometry";
import { LookAroundTool } from "../LookAroundTool";
import { SvgCamera, SvgHelpCircularHollow } from "@itwin/itwinui-icons-react";

const CameraWidget = () => {
  const [activeCamIndex, setActiveCamIndex] = React.useState<number>(0);
  const [activeCamLensAngle, setActiveCamLensAngle] = React.useState<number>(CameraManager.getActiveCamera().getLensAngle().degrees);
  const [activeCamRotation, setActiveCamRotation] = React.useState<number>(CameraManager.getActiveCamera().getRotationalAngle().degrees);
  const [cameraList, setCameraList] = React.useState<CustomCamera[]>([]);
  const [toolIsActive, setToolIsActive] = React.useState<boolean>(false);

  /** Initialize the look-around namespace on widget load */
  useEffect(() => {
    void IModelApp.localization.registerNamespace("lookaround-i18n-namespace");
    LookAroundTool.register("lookaround-i18n-namespace");

    return () => {
      IModelApp.localization.unregisterNamespace("lookaround-i18n-namespace");
      IModelApp.tools.unRegister(LookAroundTool.toolId);
    };
  }, []);

  /** Listen for changes to the selected camera */
  React.useEffect(() => {
    setActiveCamIndex(CameraManager.getActiveCameraIndex());
    setCameraList(CameraManager.getCameraList());
    return CameraManager.onChangeOccur.addListener((newCamList, newActive) => {
      setActiveCamIndex(newActive);
      setCameraList(newCamList);
      setActiveCamLensAngle(newCamList[newActive].getLensAngle().degrees);
      setActiveCamRotation(newCamList[newActive].getRotationalAngle().degrees);
    });
  }, []);

  /** Active camera change handler */
  const handleActiveCamChange = (newIndex: number) => {
    CameraManager.setActiveCameraIndex(newIndex);
    IModelApp.viewManager.invalidateDecorationsAllViews();
  };

  /** Lens angle change handler */
  const handleLensAngleChange = (newLensDegrees: number) => {
    if (newLensDegrees >= LENS_ANGLE_MINIMUM && newLensDegrees <= LENS_ANGLE_MAXIMUM) {
      CameraManager.getActiveCamera().setLensAngle(Angle.createDegrees(newLensDegrees));
      setActiveCamLensAngle(CameraManager.getActiveCamera().getLensAngle().degrees);
      IModelApp.viewManager.invalidateDecorationsAllViews();
    }
  };

  /** Passed into look around tool for scrolling */
  const handleScrollAnimation = (delta: number) => {
    const currentLensAngle = CameraManager.getActiveCamera().getLensAngle().degrees;

    /** Make delta a fixed number depending on sign to keep scrolling consistent across different computers and touchpad vs. mouse */
    if (delta > 0)
      handleLensAngleChange(currentLensAngle - 2.5);
    else
      handleLensAngleChange(currentLensAngle + 2.5);
  };

  /** Passed into look around tool for shift-scrolling */
  const handleShiftScrollAnimation = (delta: number) => {
    const currentDegrees = CameraManager.getActiveCamera().getRotationalAngle().degrees;

    /** Make delta a fixed number depending on sign to keep scrolling consistent across different computers and touchpad vs. mouse */
    if (delta > 0)
      handleThetaChange(currentDegrees - 7.5);
    else
      handleThetaChange(currentDegrees + 7.5);

  };

  /** When look-around tool is clicked */
  const handleLookAround = () => {
    if (IModelApp.toolAdmin.activeTool?.toolId !== LookAroundTool.toolId) {
      void IModelApp.tools.run(LookAroundTool.toolId, handleScrollAnimation, handleShiftScrollAnimation, handleLookAround, setToolIsActive);
      setToolIsActive(true);
    } else {
      void IModelApp.toolAdmin.activeTool.exitTool();
      setToolIsActive(false);
    }
  };

  /** Rotation change handler */
  const handleThetaChange = (degrees: number) => {
    if (degrees >= -180 && degrees <= 180) {
      CameraManager.getActiveCamera().setRotationAngle(Angle.createDegrees(degrees));
      setActiveCamRotation(CameraManager.getActiveCamera().getRotationalAngle().degrees);
      IModelApp.viewManager.invalidateDecorationsAllViews();
    }
  };

  return (
    <div className="sample-top_level">
      <div className="sample-dual-content">
        <div className="sample-options">
          <div className="sample-tool_and_tip:">
            <Button
              startIcon={<SvgCamera />}
              onClick={()=>{handleLookAround();}}
              disabled={toolIsActive}>
              Look-Around Tool
            </Button>
            <Tooltip
              content="Left click and drag in the left view to adjust the camera target while keeping the eye point fixed. Scroll to adjust lens angle, and shift-scroll to rotate."
              placement="top"
            >
              <Button
                styleType="borderless"
                style={{ marginLeft: "4px" }}
                startIcon={<SvgHelpCircularHollow/>}
              />
            </Tooltip>

          </div>
          <div className="sample-sliderbox">
            {toolIsActive ? "Lens Angle (scroll):" : "Lens Angle:"}
            <Slider
              style={{ width: "100%" }}
              minLabel={`${  LENS_ANGLE_MINIMUM}`}
              maxLabel={`${  LENS_ANGLE_MAXIMUM}`}
              min={LENS_ANGLE_MINIMUM}
              max={LENS_ANGLE_MAXIMUM}
              trackDisplayMode="auto"
              onUpdate={(e)=>{handleLensAngleChange(e[0]);}}
              values={[
                activeCamLensAngle,
              ]}
            />
          </div>
          <div className="sample-sliderbox">
            {toolIsActive ? "Rotation (shift scroll):" : "Rotation:"}
            <Slider
              style={{ width: "100%" }}
              minLabel="-180"
              maxLabel="180"
              step={7.5}
              min={-180}
              max={180}
              trackDisplayMode="auto"
              onUpdate={(e)=>{handleThetaChange(e[0]);}}
              values={[
                activeCamRotation,
              ]}
            />
          </div>
        </div>
        <div className="sample-table-div2">
          <CameraTable
            activeIndex={activeCamIndex}
            changeActive={handleActiveCamChange}
            cameraList={cameraList} />
        </div>
      </div>

      <Alert type="informational">
      Use the default view navigation tools or the Look Around tool to navigate the left view and watch how the camera visualization responds in the right view.
      </Alert>
    </div>

  );
};

export class CameraManagerWidgetProvider implements UiItemsProvider {
  public readonly id: string = "CameraWidget";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Bottom) {
      widgets.push(
        {
          id: "MultiViewportWidget",
          label: "Camera Visualizer",
          defaultState: WidgetState.Open,
          getWidgetContent: () => <CameraWidget />,
        }
      );
    }
    return widgets;
  }
}

