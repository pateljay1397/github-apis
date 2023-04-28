/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AngleSweep, Arc3d, Matrix3d, Point3d, Range3d, Vector3d } from "@itwin/core-geometry";
import { Button, Headline, IconButton, Small, Text, toaster } from "@itwin/itwinui-react";
import { ColorByName, ColorDef, FeatureOverrideType, Placement3d } from "@itwin/core-common";
import { EmphasizeElements, IModelApp } from "@itwin/core-frontend";
import { queryAdvertisingBoard, queryPitchBoundingBox, queryRailingElements, querySeatingPlatforms } from "./StadiumDataApi";
import React, { useEffect, useState } from "react";
import { SvgAdd, SvgMinimize } from "@itwin/itwinui-icons-react";
import { useActiveIModelConnection, useActiveViewport } from "@itwin/appui-react";

import { SeatViewTool } from "./SeatViewTool";
import { SectionChangeTool } from "./SectionChangeTool";
import { SectionPicker } from "./SectionPicker";
import "./GameDetails.scss";

export const GameDetails = () => {
  const [eyePoint, setEyePoint] = useState<Point3d>();
  const [targetPoint, setTargetPoint] = useState<Point3d>();
  const [calculatedArc, setCalculatedArc] = useState<Arc3d>();
  const [sectionSwitch, setSectionSwitch] = useState<boolean>(true);
  const [ticketCount, setTicketCount] = useState<number>(2);
  const [ticketCost, setTicketCost] = useState<number>(120);
  const iModelConnection = useActiveIModelConnection();
  const viewPort = useActiveViewport();

  const futureDate = new Date(new Date().setDate(new Date().getDate() + 2));
  const date = new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(futureDate).replace(/ /g, "/ ");

  useEffect(() => {
    if (!viewPort || !iModelConnection) return;

    viewPort.turnCameraOn();

    // Registering the tools
    SectionChangeTool.register();
    SeatViewTool.register();

    // Calculating the center of the Green Pitch
    queryPitchBoundingBox(iModelConnection).then((response) => {
      const placement = Placement3d.fromJSON({ origin: response.origin, angles: { pitch: response.pitch, roll: response.roll, yaw: response.yaw } });
      const transform = placement.transform;
      const box = Range3d.create(Point3d.fromJSON(response.bBoxLow), Point3d.fromJSON(response.bBoxHigh));
      setTargetPoint(transform.multiplyRange(box).center);
    }).catch(console.error);

    // Adding transparency to the protective netting and glass
    queryRailingElements(iModelConnection).then((response) => {
      const provider = EmphasizeElements.getOrCreate(viewPort);
      provider.overrideElements(response, viewPort, ColorDef.fromTbgr(ColorDef.withTransparency(ColorDef.create(ColorByName.pink).tbgr, 200)), FeatureOverrideType.AlphaOnly, true);
    }).catch(console.error);

    querySeatingPlatforms(iModelConnection).then((response) => {
      const provider = EmphasizeElements.getOrCreate(viewPort);
      provider.overrideElements(response, viewPort, ColorDef.fromTbgr(ColorDef.create(ColorByName.lightGrey).tbgr), FeatureOverrideType.ColorOnly, true);
    }).catch(console.error);

    queryAdvertisingBoard(iModelConnection).then((response) => {
      const provider = EmphasizeElements.getOrCreate(viewPort);
      provider.overrideElements(response, viewPort, ColorDef.fromTbgr(ColorDef.create(ColorByName.mediumVioletRed).tbgr), FeatureOverrideType.ColorOnly, true);
    }).catch(console.error);
  }, [iModelConnection, viewPort]);

  useEffect(() => {
    if (viewPort && eyePoint && calculatedArc) {
      sectionSwitch ? void IModelApp.tools.run(SectionChangeTool.toolId, viewPort, eyePoint, calculatedArc, animationCompleteCallback) :
        void IModelApp.tools.run(SeatViewTool.toolId, viewPort, eyePoint, calculatedArc, "Center");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calculatedArc, sectionSwitch]);

  const animationCompleteCallback = (): void => {
    setSectionSwitch(false);
  };

  const handleSectionChange = (seatInfo: Point3d, ticketPrice: number): void => {
    viewPort?.setAnimator(undefined);

    // Increasing the height of Camera placement from the seats before setting the seatOrigin state.
    seatInfo.z += 0.5;
    setEyePoint(seatInfo);
    setTicketCount(2);
    setTicketCost(ticketPrice);
    if (targetPoint && seatInfo) {
      const uPoint = (Vector3d.createFrom(targetPoint).minus(Vector3d.createFrom(seatInfo))).normalize();
      const vPoint = (uPoint?.crossProduct(Vector3d.unitZ()))?.normalize();
      const wPoint = uPoint?.crossProduct(vPoint!);
      const matrix = Matrix3d.createColumns(uPoint!, vPoint!, wPoint!);
      const arc = Arc3d.createRefs(seatInfo, matrix, AngleSweep.createStartEndDegrees(-(20), 20));
      setCalculatedArc(arc);
      setSectionSwitch(true);
    }
  };

  const displayMessageToast = (message: string) => {
    toaster.setSettings({
      placement: "top",
      order: "ascending",
    });

    toaster.positive(message, {
      duration: 3000,
    });
  };

  return (
    <div className="main-wrapper">
      <div>
        <Headline>Game Information</Headline>
        <Text className="title-text" variant="subheading">Teams: Vipers VS Great Lakers</Text>
        <Text className="title-text" variant="subheading">Date: {date}</Text>
      </div>
      <div>
        {viewPort && <SectionPicker onSectionChange={handleSectionChange} />}
      </div>
      <div className="ticket-wrapper">
        <Text variant="leading">${ticketCost.toFixed(2)} ea + Taxes</Text>
        <div className="icon-wrapper">
          <IconButton size="small" onClick={() => { if (ticketCount > 0) setTicketCount(ticketCount - 1); }}>{<SvgMinimize />}</IconButton>
          <Text variant="leading" >{ticketCount}</Text>
          <IconButton size="small" onClick={() => { setTicketCount(ticketCount + 1); }} >{<SvgAdd />}</IconButton>
        </div>
      </div>
      <div className="price-wrapper">
        <div className="price-subtotal">
          <Text variant="leading">Subtotal</Text>
          <Text variant="leading">${(ticketCount * ticketCost * 1.13).toFixed(2)}</Text>
        </div>
        {ticketCount > 1 ? <Small isMuted>{ticketCount} Tickets</Small> : <Small isMuted>{ticketCount} Ticket</Small>}
        <Button styleType="cta" onClick={() => displayMessageToast("Your order is being processed .....")}>Buy Now</Button>
      </div>
    </div>
  );
};
