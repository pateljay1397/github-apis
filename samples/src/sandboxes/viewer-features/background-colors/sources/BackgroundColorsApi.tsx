/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { ColorDef, DisplayStyle3dSettingsProps, Environment, SkyBox, SkyGradient } from "@itwin/core-common";
import { Viewport, ViewState3d } from "@itwin/core-frontend";

export interface TwoColor {
  nadirColor: ColorDef;
  zenithColor: ColorDef;
}

export interface FourColor {
  nadirColor: ColorDef;
  zenithColor: ColorDef;
  skyColor: ColorDef;
  groundColor: ColorDef;
}

export default class BackgroundColorsApi {
  public static applySingleColor(viewport: Viewport, backgroundColor: number) {
    const style: DisplayStyle3dSettingsProps = {
      backgroundColor,
      environment: {
        sky: {
          display: false,
        },
      },
    };

    viewport.overrideDisplayStyle(style);
  }

  public static applyTwoColorGradient(viewport: Viewport, colors: TwoColor) {
    const gradient = SkyGradient.create({
      ...colors,
      skyColor: colors.nadirColor,
      groundColor: colors.zenithColor,
      twoColor: true,
    });

    (viewport.view as ViewState3d).displayStyle.environment = Environment.create({
      sky: SkyBox.createGradient(gradient),
      displaySky: true,
    });
  }

  public static applyFourColorGradient(viewport: Viewport, colors: FourColor) {
    const gradient = SkyGradient.create({
      ...colors,
    });

    (viewport.view as ViewState3d).displayStyle.environment = Environment.create({
      sky: SkyBox.createGradient(gradient),
      displaySky: true,
    });
  }
}
