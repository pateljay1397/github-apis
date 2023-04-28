/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React from "react";
import { StandardViewId } from "@itwin/core-frontend";
import { Select } from "@itwin/itwinui-react";

export interface ViewPickerProps {
  /** function to run when user selects a view */
  selectedView: StandardViewId;
  onChange?: ((viewId: StandardViewId) => void) | undefined;
  disabled?: boolean;
  className?: string;
}

export const StandardViewPicker = ({ selectedView, onChange, disabled, className }: ViewPickerProps) => {
  const options = [
    { value: StandardViewId.Top, label: "Top" },
    { value: StandardViewId.Bottom, label: "Bottom" },
    { value: StandardViewId.Left, label: "Left" },
    { value: StandardViewId.Right, label: "Right" },
    { value: StandardViewId.Front, label: "Front" },
    { value: StandardViewId.Back, label: "Back" },
    { value: StandardViewId.Iso, label: "Iso" },
    { value: StandardViewId.RightIso, label: "RightIso" },
  ];
  return <Select className={className} value={selectedView} onChange={onChange} disabled={disabled} options={options} />;
};
