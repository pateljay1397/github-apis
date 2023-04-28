/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useState } from "react";
import { LabeledSelect } from "@itwin/itwinui-react";
import { Point3d } from "@itwin/core-geometry";
import { querySeatsOrigin } from "./StadiumDataApi";
import { useActiveIModelConnection } from "@itwin/appui-react";

export interface SectionPickerProps {
  onSectionChange: (_seatInfo: Point3d, _price: number) => void;
}

export const SectionPicker = ({ onSectionChange }: SectionPickerProps) => {
  const iModelConnection = useActiveIModelConnection();
  const [value, setValue] = useState<number>(0x20000019599);

  /* This array maps the section names (ex. "Balcony Club") to the ECInstanceIds of specific seats in the section.
  Using these ids, we will query the iModel to get the eyepoint and direction for the view.
  In a real application, the ids themselves would be found by querying the iModel and not hardcoded like this.*/

  const options = [
    { value: 0x20000019599, label: "Balcony Club", price: 120 },
    { value: 0x200000182a3, label: "Royal Club", price: 140 },
    { value: 0x2000001d8e5, label: "Silver Club", price: 160 },
    { value: 0x2000001b179, label: "Gold Club", price: 180 },
    { value: 0x20000018474, label: "Platinum Club", price: 200 },
    { value: 0x2000001dfcd, label: "Diamond Club", price: 220 },
  ];

  const handleOnChange = (seatId: Number) => {
    if (iModelConnection) {
      querySeatsOrigin(iModelConnection, seatId).then((response: Point3d) => {
        onSectionChange(response, options.find((option) => option.value === seatId)?.price!);
      }).catch(console.error);
    }
  };
  return (
    <LabeledSelect
      label="Choose a Section:"
      options={options}
      value={value}
      onChange={(e) => { setValue(e); handleOnChange(e); }}
    ></LabeledSelect>
  );
};
