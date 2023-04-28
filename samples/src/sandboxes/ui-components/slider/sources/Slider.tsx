/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useCallback, useMemo, useState } from "react";
import { SvgSmileyHappy, SvgSmileySad } from "@itwin/itwinui-icons-react";
import { Body, Slider } from "@itwin/itwinui-react";
import { ITwinLayout } from "./itwinui-demo/Layout";

// Demonstrates iTwinUI react components
// For more information please visit official repository in Github:
// https://github.com/iTwin/iTwinUI-react

/* eslint-disable react-hooks/rules-of-hooks */

const basicSlider = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/input-slider--basic",
  component: () =>
    <Slider
      style={{ width: "100%" }}
      thumbMode="inhibit-crossing"
      trackDisplayMode="auto"
      values={[
        50,
      ]}
    />,
};

const rangeSlider = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/input-slider--range",
  component: () =>
    <Slider
      style={{ width: "100%" }}
      max={100}
      min={0}
      thumbMode="inhibit-crossing"
      trackDisplayMode="auto"
      values={[
        20,
        80,
      ]}
    />,
};

const multiRangeSlider = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/input-slider--multi-thumbs-allow-crossing",
  component: () =>
    <Slider
      style={{ width: "100%" }}
      thumbMode="allow-crossing"
      trackDisplayMode="even-segments"
      values={[
        20,
        40,
        60,
        80,
      ]}
    />,
};

const customThumbSlider = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/input-slider--with-custom-thumb",
  component: () =>
    <Slider
      style={{ width: "100%" }}
      maxLabel={<SvgSmileySad />}
      minLabel={<SvgSmileyHappy />}
      railContainerProps={{
        style: {
          margin: "0 8px",
        },
      }}
      thumbProps={() => ({
        style: {
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#999",
          width: "36px",
          height: "26px",
          borderRadius: "4px",
          transform: "translateX(-19.2px)",
          top: 0,
        },
        children: (
          <span style={{ pointerEvents: "none", marginBottom: "4px" }}>|||</span>
        ),
      })}
      thumbMode="inhibit-crossing"
      trackDisplayMode="auto"
      values={[50]}
    />,
};

const disabledSlider = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/input-slider--disabled",
  component: () =>
    <Slider
      style={{ width: "100%" }}
      disabled
      max={60}
      min={0}
      thumbMode="inhibit-crossing"
      trackDisplayMode="auto"
      values={[30]}
    />,
};

const customTooltipSlider = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/input-slider--custom-tooltip",
  component: () =>
    < Slider
      style={{ width: "100%" }}
      max={60}
      min={0}
      thumbMode="inhibit-crossing"
      tickLabels={["0", "20", "40", "60"]}
      trackDisplayMode="auto"
      tooltipProps={(_index: number, value: number) => ({ content: `$${value}.00` })}
      values={[20]}
    />,
};

const decimalIncrementSlider = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/input-slider--decimal-increment",
  component: () =>
    <Slider
      style={{ width: "100%" }}
      max={50}
      min={0}
      step={2.5}
      thumbMode="inhibit-crossing"
      trackDisplayMode="auto"
      values={[25]}
    />,
};

const customTicksSlider = {
  helpUrl: "https://itwin.github.io/iTwinUI-react/?path=/story/input-slider--custom-tick-no-tooltip",
  component: () => {
    const dateFormatter = useMemo(() => {
      return new Intl.DateTimeFormat("default", {
        month: "short",
        day: "2-digit",
        timeZone: "UTC",
      });
    }, []);

    const [value, setValue] = useState(0);
    const [currentDate, setCurrentDate] = useState(
      new Date(Date.UTC(2019, 0, 1))
    );

    const updateDate = useCallback((values: ReadonlyArray<number>) => {
      const newDate = new Date(Date.UTC(2019, 0, values[0]));
      setCurrentDate(newDate);
      setValue(values[0]);
    }, []);

    return (
      <Slider
        min={0}
        minLabel="Date"
        max={365}
        maxLabel=""
        onUpdate={updateDate}
        onChange={updateDate}
        values={[value]}
        tooltipProps={() => ({ visible: false })}
        tickLabels={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: "20px",
            }}
          >
            <Body style={{ width: "60px", marginRight: "6px" }}>
              {dateFormatter.format(currentDate)}
            </Body>
          </div>
        }
      />
    );
  },
};

const App = () => <ITwinLayout
  headline="Different styles of sliders to be used in iTwin.js applications"
  components={[
    { title: "Slider", component: basicSlider, info: "Basic default slider" },
    { title: "Range Slider", component: rangeSlider, info: "Slider with supporting range selection" },
    { title: "Multi Range Slider", component: multiRangeSlider, info: "Multi-Thumb Slider that allows Crossing" },
    { title: "Slider with Custom Images", component: customThumbSlider, info: "Slider with minLabel and maxLabel props" },
    { title: "Disabled Slider", component: disabledSlider, info: "Slider with disabled prop" },
    { title: "Slider with Tooltip", component: customTooltipSlider, info: "Slider with a customized ToolTip" },
    { title: "Decimal Increment Slider", component: decimalIncrementSlider, info: "Slider with fixed decimal increment" },
    { title: "Slider with Custom Ticks", component: customTicksSlider, info: "Slider with with custom ticks and label" },
  ]} />;

export default App;
