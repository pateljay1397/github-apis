/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useState } from "react";
import { SvgHelpCircularHollow, SvgMoon, SvgSun } from "@itwin/itwinui-icons-react";
import { Button, Headline, IconButton, Leading, Small, ThemeProvider, ThemeType, Tooltip } from "@itwin/itwinui-react";
import logo from "./itwinui.svg";
import "./Layout.scss";

type Size = "small" | "large" | undefined;

interface ComponentProps {
  disabled?: boolean;
  size?: Size;
}

export interface Demo {
  helpUrl?: string;
  component: (args: ComponentProps) => React.ReactNode;
}

export interface ComponentDef {
  title: string;
  component: Demo;
  info?: string;
}

export interface LayoutProps {
  headline: string;
  components: ComponentDef[];
  controls?: (size: string, onSize: (value: string) => void, disabled: boolean, onDisabled: (value: boolean) => void) => React.ReactNode;
}

export const ITwinLayout = ({ headline, components, controls }: LayoutProps) => {
  const [theme, setTheme] = useState<ThemeType>("dark");
  const [size, setSize] = useState<string>("default");
  const [disabled, setDisabled] = useState<boolean>(false);

  const _size = size !== "default" ? size as Size : undefined;

  return (
    <div className="sample-components">
      <ThemeProvider theme={theme} />
      <div className="caption">
        <img src={logo} alt="itwinui react components"></img>
        <Headline>React Components</Headline>
        <Leading isMuted className="caption-subtitle">{headline}</Leading>
      </div>
      <div className="controls">
        {controls && controls(size, setSize, disabled, setDisabled)}
        <Tooltip content={`Change theme to ${theme === "dark" ? "light" : "dark"}`}>
          <IconButton size="small" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <SvgSun /> : <SvgMoon />}
          </IconButton>
        </Tooltip>
      </div>
      <div className="component-container">
        {components.map((item, index) => (
          <React.Fragment key={`layout-item-${index}`}>
            <div>
              <Leading style={{ marginBottom: 0 }} >{item.title}
                {item.component.helpUrl && <Button
                  as="a"
                  href={item.component.helpUrl}
                  size="small"
                  styleType="borderless"
                  target="_blank"
                  style={{ marginLeft: "4px" }}
                  startIcon={<SvgHelpCircularHollow />}
                />}
              </Leading>
              {item.info && <Small isMuted>{item.info}</Small>}
            </div>
            <div>{item.component.component({ size: _size, disabled })}</div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
