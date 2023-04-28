/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { ColorDef, DisplayStyle3dSettingsProps } from "@itwin/core-common";

export type BackgroundPresets = "Custom" | "1 Color - Purple" | "1 Color - Transparent" | "2 Color - Clear" | "2 Color - Peach" | "2 Color - Storm" | "4 Color - Day" | "4 Color - Sunset" | "4 Color - Miami" | "4 Color - Morning";

const hexToTbgr = (hexCode: string) => ColorDef.computeTbgrFromString(hexCode);

export const backgroundPresets: Record<BackgroundPresets, DisplayStyle3dSettingsProps> = {
  "Custom": {
    environment: {
    },
  },
  "1 Color - Purple" : {
    backgroundColor: hexToTbgr("#8500b2"),
    environment: {
      sky: {
        display: false,
      },
    },
  },
  "1 Color - Transparent" : {
    backgroundColor: hexToTbgr("#8500b2"),
    environment: {
      sky: {
        display: false,
      },
    },
  },
  "2 Color - Clear": {
    environment: {
      sky: {
        display: true,
        nadirColor: hexToTbgr("#ffffff"),
        zenithColor: hexToTbgr("#0000ff"),
        twoColor: true,
      },
    },
  },
  "2 Color - Peach": {
    environment: {
      sky: {
        display: true,
        nadirColor: hexToTbgr("#ee82ee"),
        zenithColor: hexToTbgr("#ffa500"),
        twoColor: true,
      },
    },
  },
  "2 Color - Storm": {
    environment: {
      sky: {
        display: true,
        nadirColor: hexToTbgr("#ffffff"),
        zenithColor: hexToTbgr("#000000"),
        twoColor: true,
      },
    },
  },
  "4 Color - Day": {
    environment: {
      sky: {
        display: true,
        nadirColor: hexToTbgr("#000000"),
        skyColor: hexToTbgr("#00ffff"),
        groundColor: hexToTbgr("#d2b48c"),
        zenithColor: hexToTbgr("#0000ff"),
        twoColor: false,
      },
    },
  },
  "4 Color - Miami": {
    environment: {
      sky: {
        display: true,
        nadirColor: hexToTbgr("#ffa500"),
        skyColor: hexToTbgr("#800080"),
        groundColor: hexToTbgr("#800080"),
        zenithColor: hexToTbgr("#4b0082"),
        twoColor: false,
      },
    },
  },
  "4 Color - Sunset": {
    environment: {
      sky: {
        display: true,
        nadirColor: hexToTbgr("#4b0082"),
        skyColor: hexToTbgr("#ffa500"),
        groundColor: hexToTbgr("#ffa500"),
        zenithColor: hexToTbgr("#00ffff"),
        twoColor: false,
      },
    },
  },
  "4 Color - Morning": {
    environment: {
      sky: {
        display: true,
        nadirColor: hexToTbgr("#808000"),
        skyColor: hexToTbgr("#d2b48c"),
        groundColor: hexToTbgr("#d2b48c"),
        zenithColor: hexToTbgr("#00ffff"),
        twoColor: false,
      },
    },
  },
};
