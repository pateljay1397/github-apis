/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

/* eslint-disable react-hooks/exhaustive-deps */

import { ColorDef } from "@itwin/core-common";
import { IModelApp } from "@itwin/core-frontend";
import { ColorPickerPopup } from "@itwin/imodel-components-react";
import { SvgAdd, SvgCheckmark, SvgDelete, SvgEdit, SvgVisibilityHide, SvgVisibilityShow } from "@itwin/itwinui-icons-react";
import { Button, Table } from "@itwin/itwinui-react";
import React from "react";
import "../camera-visualizer.scss";
import { CameraManager, MAX_CAMERA_NUMBER } from "../CameraManager";
import { CustomCamera } from "../visuals/CustomCamera";

export interface CameraTableProps {
  cameraList: CustomCamera[];
  activeIndex: number;
  changeActive: (newIndex: number) => void;
}

export const CameraTable = (props: CameraTableProps) => {

  /** Background color for active camera in table */
  const ROW_COLOR = "#374349";

  /** Keeps track of the cameras */
  const [camList, setCamList] = React.useState([...CameraManager.getCameraList()]);

  /** True if a camera name is currently being edited */
  const [editNameState, setEditNameState] = React.useState(false);

  /** Contains name of the camera being edited */
  const [inputFieldTextState, setInputFieldTextState] = React.useState("");

  /** Keeps track of the active camera index */
  const [activeCamIndex, setActiveCameraIndex] = React.useState(0);

  /** onClick for "Delete Selected Camera" */
  const handleCameraRemoval = () => {
    setEditNameState(false);
    const activeIndex = CameraManager.getActiveCameraIndex();
    setActiveCameraIndex(activeIndex-1);
    props.changeActive(activeIndex-1);

    CameraManager.removeCameraFromList(activeIndex);
    setCamList([...CameraManager.getCameraList()]);
  };

  /** onClick for Visibility toggle buttons */
  const handleCameraVisibilityToggle = (indexToToggle: number) => {
    setEditNameState(false);
    CameraManager.toggleVisibility(indexToToggle);
    setCamList([...CameraManager.getCameraList()]);
    IModelApp.viewManager.invalidateDecorationsAllViews();

  };

  /** Handles changing a cameras color */
  const handleColorChange = (index: number, newColor: ColorDef) => {
    setEditNameState(false);
    CameraManager.editColorAtIndex(index, newColor);
    IModelApp.viewManager.invalidateDecorationsAllViews();
  };

  /** Gets a random color when cloning a new camera */
  const getRandomColor = () => {
    const r = Math.random()*255;
    const g = Math.random()*255;
    const b = Math.random()*255;
    const colorString = `#${  Math.round(r).toString(16)  }${Math.round(g).toString(16)  }${Math.round(b).toString(16)}`;
    const myColor = ColorDef.fromString(colorString);
    return myColor;

  };

  /** onClick for "Clone Selected Camera" Button */
  const handleNewCamera = () => {
    setEditNameState(false);
    const color = getRandomColor();
    CameraManager.addCameraToList(color);
    setActiveCameraIndex(camList.length);
    props.changeActive(camList.length);
    setCamList([...CameraManager.getCameraList()]);
  };

  /** Called everytime the name input field changes */
  const updateNewName = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    setInputFieldTextState(e.target.value);
    CameraManager.setNameAtIndex(index, e.target.value);
  };

  /** onClick for EDIT icon being clicked */
  const handleNameEdit = (index: number) => {
    setInputFieldTextState(CameraManager.getNameAtIndex(index));
    setEditNameState(true);
  };

  /** onClick for a row of the table being clicked */
  const handleRowClick = (index: number) => {
    /** If we are editing and a different row is selected, set edit state to false */
    if(editNameState && index !== CameraManager.getActiveCameraIndex())
      setEditNameState(false);
    props.changeActive(index);
    setActiveCameraIndex(index);

  };

  /** The columns of the camera table */
  const columns = React.useMemo(() => [
    {
      Header: "Cameras",
      columns: [
        {
          id: "name",
          Header: "Camera Name",
          accessor: "name",
          minWidth: 240,
        },
        {
          id: "options",
          Header: "Camera Options",
          accessor: "options",
          width: 200,
        },
      ],
    },
  ], []);

  /**
   *  Return a cell that contains the Camera's name (bolded and with an edit icon if active).
   *  Can also return an input field if editNameState is true.
   */
  const getCameraNameCell = (index: number) => {
    return (
      <div style={{width:"100%"}} onClick={() => {handleRowClick(index);}}>
        <div>
          {/** If it's not the active camera, the NAME column of the table is simply a span element with the name */}
          {(CameraManager.getActiveCameraIndex()!==index &&
            <span style={{ fontSize:"15px", paddingLeft:"16px", fontWeight: "lighter"}}>{CameraManager.getNameAtIndex(index)}</span>)}

          {/**
          *   If it's the active camera do one of two things depending on editNameState:
          *     if editNameState is true, show an input field with a checkmark button
          *     if editNameState is false, show the same span element from above with an edit button
          */}
          {(CameraManager.getActiveCameraIndex()===index &&
            (editNameState ?
              <div className="sample-nameCol-inner">
                <input style={{fontWeight: "bolder", fontSize:"16px", font:"Open Sans", color:"white", backgroundColor:ROW_COLOR}}
                  maxLength={20}
                  onFocus={(e)=>{e.target.select();}}
                  onKeyDown={(e)=>{if (e.key === "Enter") setEditNameState(false);}}
                  autoFocus={true} onChange={(e) => updateNewName(index, e)}
                  type="text"
                  value={inputFieldTextState}>
                </input>

                <Button
                  startIcon= {<SvgCheckmark></SvgCheckmark>}
                  onClick={()=>{setEditNameState(false);}}
                  styleType="borderless"
                />
              </div>
              :
              <div className="sample-nameCol-inner">
                <span style={{fontWeight: "bolder", fontSize:"16px"}}>{CameraManager.getNameAtIndex(index)}</span>

                <Button
                  startIcon= {<SvgEdit></SvgEdit>}
                  onClick={()=>{handleNameEdit(index);}}
                  styleType="borderless"
                  style={{paddingLeft: 8}}

                />
              </div>))}
        </div>
      </div>
    );
  };

  /**
   * Returns the options for any given camera.
   * This includes a color picker and a visibility toggle.
   */
  const getCameraOptionsCell = (index: number) => {
    const activeCam = CameraManager.getActiveCameraIndex();
    return <div className="sample-spacebetween-horizontal">
      <ColorPickerPopup initialColor={CameraManager.getColorAtIndex(index)} onColorChange={(newColor)=>handleColorChange(index, newColor)} />

      <Button
        startIcon={camList[index].isVisible() || activeCam===index  ? <SvgVisibilityShow /> : <SvgVisibilityHide />}
        disabled={activeCam===index}
        onClick={()=>{handleCameraVisibilityToggle(index);}}
      />
    </div>;
  };

  /** Generate the data for the table */
  const generateTableData = () => {
    const data: {name: JSX.Element, options: JSX.Element}[] = [];

    for (let camIndex = 0; camIndex < camList.length; camIndex++) {
      data.push({
        name: getCameraNameCell(camIndex),
        options: getCameraOptionsCell(camIndex),
      });
    }

    return data;
  };

  /** Generate a new table any time the camera list changes, the active camera changes, or a name is being edited. */
  const tableData: {name: JSX.Element, options: JSX.Element}[] = React.useMemo(generateTableData, [camList, activeCamIndex, editNameState, inputFieldTextState]);

  return (
    <div>
      <Table
        columns={columns}
        data={tableData}
        emptyTableContent='No data - Table content EMPTY'
        isLoading={false}
        selectionMode="single"
        density="extra-condensed"
        enableVirtualization style={{height: 175}}
      />

      <div className="sample-spacearound-horizontal">
        <Button startIcon={<SvgAdd />}
          onClick={()=>{handleNewCamera();}}
          disabled={camList.length>=MAX_CAMERA_NUMBER}>
          Clone Selected Camera
        </Button>

        <Button startIcon={<SvgDelete />}
          onClick={()=>{handleCameraRemoval();}}
          disabled={camList.length===1}>
          Delete Selected Camera
        </Button>
      </div>
    </div>
  );
};
