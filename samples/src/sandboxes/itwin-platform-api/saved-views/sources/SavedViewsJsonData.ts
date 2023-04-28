/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { GroupsResponseInterface, SavedViewDetailResponseInterface, SavedViewsResponseInterface } from "./SavedViewsInterfaces";

// #region Groups List
/**
 * Groups List Sample Data.
 */
export const groupsList: GroupsResponseInterface = {
  groups: [{
    id: "APkyTBNR1IVBo1zBRa8E1rJN121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
    displayName: "Structure",
    _links: {
      iTwin: {
        href: "https://api.bentley.com/iTwins/656dd74d-8798-4aa4-8d13-6e6458789639",
      },
      creator: {
        href: "https://api.bentley.com/iTwins/656dd74d-8798-4aa4-8d13-6e6458789639/members/34bcee57-2839-471e-8429-7be322fd610d",
      },
      imodel: {
        href: "https://api.bentley.com/imodels/881c9ca0-34ff-4875-ae63-2dd8ac015c27",
      },
      savedViews: {
        href: "https://api.bentley.com/savedviews?groupId=APkyTBNR1IVBo1zBRa8E1rJN121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
      },
    },
    shared: true,
  }, {
    id: "AOHSBC0rUwdHtXAEp1zmdV9N121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
    displayName: "Zone A",
    _links: {
      iTwin: {
        href: "https://api.bentley.com/iTwins/656dd74d-8798-4aa4-8d13-6e6458789639",
      },
      creator: {
        href: "https://api.bentley.com/iTwins/656dd74d-8798-4aa4-8d13-6e6458789639/members/34bcee57-2839-471e-8429-7be322fd610d",
      },
      imodel: {
        href: "https://api.bentley.com/imodels/881c9ca0-34ff-4875-ae63-2dd8ac015c27",
      },
      savedViews: {
        href: "https://api.bentley.com/savedviews?groupId=AOHSBC0rUwdHtXAEp1zmdV9N121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
      },
    },
    shared: true,
  }, {
    id: "AN46P-YXqFxCo0x_hL418vdN121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
    displayName: "Zone E",
    _links: {
      iTwin: {
        href: "https://api.bentley.com/iTwins/656dd74d-8798-4aa4-8d13-6e6458789639",
      },
      creator: {
        href: "https://api.bentley.com/iTwins/656dd74d-8798-4aa4-8d13-6e6458789639/members/34bcee57-2839-471e-8429-7be322fd610d",
      },
      imodel: {
        href: "https://api.bentley.com/imodels/881c9ca0-34ff-4875-ae63-2dd8ac015c27",
      },
      savedViews: {
        href: "https://api.bentley.com/savedviews?groupId=AN46P-YXqFxCo0x_hL418vdN121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
      },
    },
    shared: true,
  }],
  _links: {
    self: {
      href: "https://api.bentley.com/savedviews/groups?iTwinId=656dd74d-8798-4aa4-8d13-6e6458789639&iModelId=881c9ca0-34ff-4875-ae63-2dd8ac015c27",
    },
  },
};
// #endregion Groups List

// #region Saved View
/**
 * Saved View Sample Data mapped as SavedViewId and SavedViewResponseInterface.
 */
export const savedViewsDetailList: { [key: string]: SavedViewDetailResponseInterface } = {
  "AMMhteRLjWVBpF1IoDJdVVZN121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw": {
    savedView: {
      id: "AMMhteRLjWVBpF1IoDJdVVZN121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
      shared: true,
      savedViewData: {
        itwin3dView: {
          origin: [32166.449465360496, 31798.806345272133, 133.4468349027684],
          extents: [259.49531202863204, 143.66143000845557, 198.30762561556855],
          angles: {
            yaw: 39.72716385808149,
            pitch: -48.4438076658827,
            roll: -42.00206622185873,
          },
          categories: {
            enabled: ["0x200000007a9"],
          },
          models: {
            enabled: ["0x20000000049", "0x20000000892", "0x20000000894", "0x20000000896", "0x20000000898", "0x2000000089a", "0x2000000089c", "0x2000000089e", "0x200000008a0", "0x200000008a2", "0x200000008a4", "0x200000008a6", "0x200000008a8", "0x200000008aa", "0x200000008ac", "0x200000008ae", "0x200000008b0", "0x200000008b2", "0x200000008b4", "0x200000008b6", "0x200000008b8", "0x200000008ba", "0x200000008bc", "0x200000008be", "0x200000008c0", "0x200000008c2"],
          },
        },
      },
      displayName: "Blue Chairs",
      tags: [],
      _links: {
        creator: {
          href: "https://api.bentley.com/iTwins/656dd74d-8798-4aa4-8d13-6e6458789639/members/34bcee57-2839-471e-8429-7be322fd610d",
        },
        iTwin: {
          href: "https://api.bentley.com/iTwins/656dd74d-8798-4aa4-8d13-6e6458789639",
        },
        imodel: {
          href: "https://api.bentley.com/imodels/881c9ca0-34ff-4875-ae63-2dd8ac015c27",
        },
        image: {
          href: "https://api.bentley.com/savedviews/AMMhteRLjWVBpF1IoDJdVVZN121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw/image?size=full",
        },
        thumbnail: {
          href: "https://api.bentley.com/savedviews/AMMhteRLjWVBpF1IoDJdVVZN121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw/image",
        },
      },
    },
  },
  "AAI5bcPNW65LiSxcFBNP9GhN121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw": {
    savedView: {
      id: "AAI5bcPNW65LiSxcFBNP9GhN121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
      shared: true,
      savedViewData: {
        itwin3dView: {
          origin: [32182.272465479386, 31805.642254058126, 163.62180192258006],
          extents: [259.49531202863204, 143.66143000845557, 198.30762561556855],
          angles: {
            yaw: 39.72716385808149,
            pitch: -48.4438076658827,
            roll: -42.00206622185873,
          },
          categories: {
            enabled: ["0x200000007a9", "0x200000007af", "0x200000007ab", "0x200000007ad"],
          },
          models: {
            enabled: ["0x20000000049", "0x20000000892", "0x20000000894", "0x20000000896", "0x20000000898", "0x2000000089a", "0x2000000089c", "0x2000000089e", "0x200000008a0", "0x200000008a2", "0x200000008a4", "0x200000008a6", "0x200000008a8", "0x200000008aa", "0x200000008ac", "0x200000008ae", "0x200000008b0", "0x200000008b2", "0x200000008b4", "0x200000008b6", "0x200000008b8", "0x200000008ba", "0x200000008bc", "0x200000008be", "0x200000008c0", "0x200000008c2"],
          },
        },
      },
      displayName: "Chairs",
      tags: [],
      _links: {
        creator: {
          href: "https://api.bentley.com/iTwins/656dd74d-8798-4aa4-8d13-6e6458789639/members/34bcee57-2839-471e-8429-7be322fd610d",
        },
        iTwin: {
          href: "https://api.bentley.com/iTwins/656dd74d-8798-4aa4-8d13-6e6458789639",
        },
        imodel: {
          href: "https://api.bentley.com/imodels/881c9ca0-34ff-4875-ae63-2dd8ac015c27",
        },
        image: {
          href: "https://api.bentley.com/savedviews/AAI5bcPNW65LiSxcFBNP9GhN121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw/image?size=full",
        },
        thumbnail: {
          href: "https://api.bentley.com/savedviews/AAI5bcPNW65LiSxcFBNP9GhN121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw/image",
        },
      },
    },
  },
  "ACrJX5txNpdAtl80t4Uhfh9N121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw": {
    savedView: {
      id: "ACrJX5txNpdAtl80t4Uhfh9N121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
      shared: true,
      savedViewData: {
        itwin3dView: {
          origin: [32092.175478918707, 31976.739247204026, -83.36262945324461],
          extents: [693.1567195137465, 383.74444904934296, 529.7138593817807],
          angles: {
            yaw: 29.999999999999986,
            pitch: -35.26438968275467,
            roll: -45,
          },
          categories: {
            enabled: ["0x20000000021", "0x200000007a3", "0x2000000079b", "0x2000000078f"],
          },
          models: {
            enabled: ["0x20000000049", "0x20000000892", "0x20000000894", "0x20000000896", "0x20000000898", "0x2000000089a", "0x2000000089c", "0x2000000089e", "0x200000008a0", "0x200000008a2", "0x200000008a4", "0x200000008a6", "0x200000008a8", "0x200000008aa", "0x200000008ac", "0x200000008ae", "0x200000008b0", "0x200000008b2", "0x200000008b4", "0x200000008b6", "0x200000008b8", "0x200000008ba", "0x200000008bc", "0x200000008be", "0x200000008c0", "0x200000008c2"],
          },
        },
      },
      displayName: "Framing Phase1",
      tags: [{
        displayName: "1F",
        id: "ACqBZIeFBVFPsSSHP76Aoz9N121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
      }, {
        displayName: "2F",
        id: "AMj5GEYWwIBGvPdE8B-eYItN121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
      }, {
        displayName: "3F",
        id: "AGYP_qhEKkdIqtUhqdK8821N121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
      }, {
        displayName: "Bottom Floor",
        id: "AENRas2DQkZNjs4OnK4qwJNN121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
      }],
      _links: {
        creator: {
          href: "https://api.bentley.com/iTwins/656dd74d-8798-4aa4-8d13-6e6458789639/members/34bcee57-2839-471e-8429-7be322fd610d",
        },
        iTwin: {
          href: "https://api.bentley.com/iTwins/656dd74d-8798-4aa4-8d13-6e6458789639",
        },
        imodel: {
          href: "https://api.bentley.com/imodels/881c9ca0-34ff-4875-ae63-2dd8ac015c27",
        },
        group: {
          href: "https://api.bentley.com/savedviews/groups/APkyTBNR1IVBo1zBRa8E1rJN121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
        },
        image: {
          href: "https://api.bentley.com/savedviews/ACrJX5txNpdAtl80t4Uhfh9N121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw/image?size=full",
        },
        thumbnail: {
          href: "https://api.bentley.com/savedviews/ACrJX5txNpdAtl80t4Uhfh9N121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw/image",
        },
      },
    },
  },
  "AO3StvP1xA9LmMWt_e-9OkdN121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw": {
    savedView: {
      id: "AO3StvP1xA9LmMWt_e-9OkdN121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
      shared: true,
      savedViewData: {
        itwin3dView: {
          origin: [32195.710046160995, 31814.747356262043, 25.093647029316344],
          extents: [440.9531699335113, 244.11987432135226, 336.97863538849845],
          angles: {
            yaw: 29.999999999999986,
            pitch: -35.26438968275467,
            roll: -45,
          },
          categories: {
            enabled: ["0x20000000021", "0x20000000163", "0x20000000169", "0x20000000175", "0x20000000167", "0x20000000139", "0x200000001ab", "0x200000001a9", "0x200000001a7", "0x200000001bb", "0x2000000018b", "0x2000000018d", "0x200000001b9", "0x2000000018f", "0x20000000191", "0x20000000165", "0x20000000141", "0x20000000133", "0x200000001fd", "0x20000000181", "0x2000000015d", "0x2000000015b", "0x20000000157"],
          },
          models: {
            enabled: ["0x20000000049", "0x20000000892", "0x20000000894", "0x20000000896", "0x20000000898", "0x2000000089a", "0x2000000089c", "0x2000000089e", "0x200000008a0", "0x200000008a2", "0x200000008a4", "0x200000008a6", "0x200000008a8", "0x200000008aa", "0x200000008ac", "0x200000008ae", "0x200000008b0", "0x200000008b2", "0x200000008b4", "0x200000008b6", "0x200000008b8", "0x200000008ba", "0x200000008bc", "0x200000008be", "0x200000008c0", "0x200000008c2"],
          },
        },
      },
      displayName: "ZoneA 1F",
      tags: [{
        displayName: "1F",
        id: "ACqBZIeFBVFPsSSHP76Aoz9N121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
      }],
      _links: {
        creator: {
          href: "https://api.bentley.com/iTwins/656dd74d-8798-4aa4-8d13-6e6458789639/members/34bcee57-2839-471e-8429-7be322fd610d",
        },
        iTwin: {
          href: "https://api.bentley.com/iTwins/656dd74d-8798-4aa4-8d13-6e6458789639",
        },
        imodel: {
          href: "https://api.bentley.com/imodels/881c9ca0-34ff-4875-ae63-2dd8ac015c27",
        },
        group: {
          href: "https://api.bentley.com/savedviews/groups/AOHSBC0rUwdHtXAEp1zmdV9N121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
        },
        image: {
          href: "https://api.bentley.com/savedviews/AO3StvP1xA9LmMWt_e-9OkdN121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw/image?size=full",
        },
        thumbnail: {
          href: "https://api.bentley.com/savedviews/AO3StvP1xA9LmMWt_e-9OkdN121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw/image",
        },
      },
    },
  },
  "AGZaq9Y3oQJFvraJLWyEej1N121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw": {
    savedView: {
      id: "AGZaq9Y3oQJFvraJLWyEej1N121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
      shared: true,
      savedViewData: {
        itwin3dView: {
          origin: [32365.111402039878, 31603.287450165597, 186.46503047856368],
          extents: [133.5740749669235, 73.94909168797454, 102.07798146098344],
          angles: {
            yaw: 29.999999999999986,
            pitch: -35.26438968275467,
            roll: -45,
          },
          categories: {
            enabled: ["0x20000000021", "0x200000001cd", "0x200000001ff", "0x20000000151", "0x20000000153", "0x20000000155", "0x2000000014f", "0x200000001ad", "0x200000001bd", "0x20000000149", "0x20000000145", "0x200000001b5", "0x200000001a5", "0x2000000016b", "0x2000000013f", "0x200000001ef", "0x200000001ed", "0x200000001eb", "0x200000001e9", "0x200000001f1", "0x2000000013b", "0x2000000016f", "0x2000000016d", "0x20000000171"],
          },
          models: {
            enabled: ["0x20000000049", "0x20000000892", "0x20000000894", "0x20000000896", "0x20000000898", "0x2000000089a", "0x2000000089c", "0x2000000089e", "0x200000008a0", "0x200000008a2", "0x200000008a4", "0x200000008a6", "0x200000008a8", "0x200000008aa", "0x200000008ac", "0x200000008ae", "0x200000008b0", "0x200000008b2", "0x200000008b4", "0x200000008b6", "0x200000008b8", "0x200000008ba", "0x200000008bc", "0x200000008be", "0x200000008c0", "0x200000008c2"],
          },
        },
      },
      displayName: "ZoneA 2F",
      tags: [{
        displayName: "2F",
        id: "AMj5GEYWwIBGvPdE8B-eYItN121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
      }],
      _links: {
        creator: {
          href: "https://api.bentley.com/iTwins/656dd74d-8798-4aa4-8d13-6e6458789639/members/34bcee57-2839-471e-8429-7be322fd610d",
        },
        iTwin: {
          href: "https://api.bentley.com/iTwins/656dd74d-8798-4aa4-8d13-6e6458789639",
        },
        imodel: {
          href: "https://api.bentley.com/imodels/881c9ca0-34ff-4875-ae63-2dd8ac015c27",
        },
        group: {
          href: "https://api.bentley.com/savedviews/groups/AOHSBC0rUwdHtXAEp1zmdV9N121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
        },
        image: {
          href: "https://api.bentley.com/savedviews/AGZaq9Y3oQJFvraJLWyEej1N121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw/image?size=full",
        },
        thumbnail: {
          href: "https://api.bentley.com/savedviews/AGZaq9Y3oQJFvraJLWyEej1N121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw/image",
        },
      },
    },
  },
  "AArIus_4lmtMmu_-3R6qJQ9N121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw": {
    savedView: {
      id: "AArIus_4lmtMmu_-3R6qJQ9N121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
      shared: true,
      savedViewData: {
        itwin3dView: {
          origin: [32497.105356594075, 31608.06035027863, 59.638020938244495],
          extents: [132.0991290709248, 73.13253421359175, 100.95082037180777],
          angles: {
            yaw: 8.008490094522395,
            pitch: -17.52623268581503,
            roll: -64.95829906508904,
          },
          categories: {
            enabled: ["0x20000000021", "0x20000000201", "0x200000001af", "0x200000001a3", "0x20000000521", "0x2000000017f", "0x2000000019b", "0x2000000019d", "0x2000000019f", "0x200000001a1"],
          },
          models: {
            enabled: ["0x20000000049", "0x20000000892", "0x20000000894", "0x20000000896", "0x20000000898", "0x2000000089a", "0x2000000089c", "0x2000000089e", "0x200000008a0", "0x200000008a2", "0x200000008a4", "0x200000008a6", "0x200000008a8", "0x200000008aa", "0x200000008ac", "0x200000008ae", "0x200000008b0", "0x200000008b2", "0x200000008b4", "0x200000008b6", "0x200000008b8", "0x200000008ba", "0x200000008bc", "0x200000008be", "0x200000008c0", "0x200000008c2"],
          },
        },
      },
      displayName: "ZoneA 3F",
      tags: [{
        displayName: "3F",
        id: "AGYP_qhEKkdIqtUhqdK8821N121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
      }],
      _links: {
        creator: {
          href: "https://api.bentley.com/iTwins/656dd74d-8798-4aa4-8d13-6e6458789639/members/34bcee57-2839-471e-8429-7be322fd610d",
        },
        iTwin: {
          href: "https://api.bentley.com/iTwins/656dd74d-8798-4aa4-8d13-6e6458789639",
        },
        imodel: {
          href: "https://api.bentley.com/imodels/881c9ca0-34ff-4875-ae63-2dd8ac015c27",
        },
        group: {
          href: "https://api.bentley.com/savedviews/groups/AOHSBC0rUwdHtXAEp1zmdV9N121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
        },
        image: {
          href: "https://api.bentley.com/savedviews/AArIus_4lmtMmu_-3R6qJQ9N121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw/image?size=full",
        },
        thumbnail: {
          href: "https://api.bentley.com/savedviews/AArIus_4lmtMmu_-3R6qJQ9N121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw/image",
        },
      },
    },
  },
  "AFgGvig5ThdPnVcY0LugAWBN121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw": {
    savedView: {
      id: "AFgGvig5ThdPnVcY0LugAWBN121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
      shared: true,
      savedViewData: {
        itwin3dView: {
          origin: [32155.24542256003, 31765.659405766048, 208.23943999602807],
          extents: [102.55634596631278, 56.77710014405483, 78.37407659273734],
          angles: {
            yaw: 39.72716385808149,
            pitch: -48.4438076658827,
            roll: -42.00206622185873,
          },
          categories: {
            enabled: ["0x20000000021", "0x200000004f3", "0x200000004f7", "0x200000004f1", "0x200000004ef", "0x200000004f5"],
          },
          models: {
            enabled: ["0x20000000049", "0x20000000892", "0x20000000894", "0x20000000896", "0x20000000898", "0x2000000089a", "0x2000000089c", "0x2000000089e", "0x200000008a0", "0x200000008a2", "0x200000008a4", "0x200000008a6", "0x200000008a8", "0x200000008aa", "0x200000008ac", "0x200000008ae", "0x200000008b0", "0x200000008b2", "0x200000008b4", "0x200000008b6", "0x200000008b8", "0x200000008ba", "0x200000008bc", "0x200000008be", "0x200000008c0", "0x200000008c2"],
          },
        },
      },
      displayName: "ZoneE BF",
      tags: [{
        displayName: "Bottom Floor",
        id: "AENRas2DQkZNjs4OnK4qwJNN121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
      }],
      _links: {
        creator: {
          href: "https://api.bentley.com/iTwins/656dd74d-8798-4aa4-8d13-6e6458789639/members/34bcee57-2839-471e-8429-7be322fd610d",
        },
        iTwin: {
          href: "https://api.bentley.com/iTwins/656dd74d-8798-4aa4-8d13-6e6458789639",
        },
        imodel: {
          href: "https://api.bentley.com/imodels/881c9ca0-34ff-4875-ae63-2dd8ac015c27",
        },
        group: {
          href: "https://api.bentley.com/savedviews/groups/AN46P-YXqFxCo0x_hL418vdN121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
        },
        image: {
          href: "https://api.bentley.com/savedviews/AFgGvig5ThdPnVcY0LugAWBN121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw/image?size=full",
        },
        thumbnail: {
          href: "https://api.bentley.com/savedviews/AFgGvig5ThdPnVcY0LugAWBN121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw/image",
        },
      },
    },
  },
};
// #endregion Saved View

// #region Saved Views List
/**
 * Saved Views List Sample Data
 */
export const savedViewsList: SavedViewsResponseInterface = {
  savedViews: [{
    id: "AMMhteRLjWVBpF1IoDJdVVZN121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
    shared: true,
    displayName: "Blue Chairs",
    tags: [],
    _links: {
      creator: {
        href: "https://api.bentley.com/iTwins/656dd74d-8798-4aa4-8d13-6e6458789639/members/34bcee57-2839-471e-8429-7be322fd610d",
      },
      iTwin: {
        href: "https://api.bentley.com/iTwins/656dd74d-8798-4aa4-8d13-6e6458789639",
      },
      imodel: {
        href: "https://api.bentley.com/imodels/881c9ca0-34ff-4875-ae63-2dd8ac015c27",
      },
      image: {
        href: "https://api.bentley.com/savedviews/AMMhteRLjWVBpF1IoDJdVVZN121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw/image?size=full",
      },
      thumbnail: {
        href: "https://api.bentley.com/savedviews/AMMhteRLjWVBpF1IoDJdVVZN121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw/image",
      },
    },
  }, {
    id: "AAI5bcPNW65LiSxcFBNP9GhN121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
    shared: true,
    displayName: "Chairs",
    tags: [],
    _links: {
      creator: {
        href: "https://api.bentley.com/iTwins/656dd74d-8798-4aa4-8d13-6e6458789639/members/34bcee57-2839-471e-8429-7be322fd610d",
      },
      iTwin: {
        href: "https://api.bentley.com/iTwins/656dd74d-8798-4aa4-8d13-6e6458789639",
      },
      imodel: {
        href: "https://api.bentley.com/imodels/881c9ca0-34ff-4875-ae63-2dd8ac015c27",
      },
      image: {
        href: "https://api.bentley.com/savedviews/AAI5bcPNW65LiSxcFBNP9GhN121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw/image?size=full",
      },
      thumbnail: {
        href: "https://api.bentley.com/savedviews/AAI5bcPNW65LiSxcFBNP9GhN121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw/image",
      },
    },
  }, {
    id: "ACrJX5txNpdAtl80t4Uhfh9N121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
    shared: true,
    displayName: "Framing Phase1",
    tags: [{
      displayName: "3F",
      id: "AGYP_qhEKkdIqtUhqdK8821N121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
    }, {
      displayName: "Bottom Floor",
      id: "AENRas2DQkZNjs4OnK4qwJNN121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
    }, {
      displayName: "1F",
      id: "ACqBZIeFBVFPsSSHP76Aoz9N121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
    }, {
      displayName: "2F",
      id: "AMj5GEYWwIBGvPdE8B-eYItN121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
    }],
    _links: {
      creator: {
        href: "https://api.bentley.com/iTwins/656dd74d-8798-4aa4-8d13-6e6458789639/members/34bcee57-2839-471e-8429-7be322fd610d",
      },
      iTwin: {
        href: "https://api.bentley.com/iTwins/656dd74d-8798-4aa4-8d13-6e6458789639",
      },
      imodel: {
        href: "https://api.bentley.com/imodels/881c9ca0-34ff-4875-ae63-2dd8ac015c27",
      },
      group: {
        href: "https://api.bentley.com/savedviews/groups/APkyTBNR1IVBo1zBRa8E1rJN121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
      },
      image: {
        href: "https://api.bentley.com/savedviews/ACrJX5txNpdAtl80t4Uhfh9N121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw/image?size=full",
      },
      thumbnail: {
        href: "https://api.bentley.com/savedviews/ACrJX5txNpdAtl80t4Uhfh9N121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw/image",
      },
    },
  }, {
    id: "AO3StvP1xA9LmMWt_e-9OkdN121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
    shared: true,
    displayName: "ZoneA 1F",
    tags: [{
      displayName: "1F",
      id: "ACqBZIeFBVFPsSSHP76Aoz9N121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
    }],
    _links: {
      creator: {
        href: "https://api.bentley.com/iTwins/656dd74d-8798-4aa4-8d13-6e6458789639/members/34bcee57-2839-471e-8429-7be322fd610d",
      },
      iTwin: {
        href: "https://api.bentley.com/iTwins/656dd74d-8798-4aa4-8d13-6e6458789639",
      },
      imodel: {
        href: "https://api.bentley.com/imodels/881c9ca0-34ff-4875-ae63-2dd8ac015c27",
      },
      group: {
        href: "https://api.bentley.com/savedviews/groups/AOHSBC0rUwdHtXAEp1zmdV9N121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
      },
      image: {
        href: "https://api.bentley.com/savedviews/AO3StvP1xA9LmMWt_e-9OkdN121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw/image?size=full",
      },
      thumbnail: {
        href: "https://api.bentley.com/savedviews/AO3StvP1xA9LmMWt_e-9OkdN121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw/image",
      },
    },
  }, {
    id: "AGZaq9Y3oQJFvraJLWyEej1N121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
    shared: true,
    displayName: "ZoneA 2F",
    tags: [{
      displayName: "2F",
      id: "AMj5GEYWwIBGvPdE8B-eYItN121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
    }],
    _links: {
      creator: {
        href: "https://api.bentley.com/iTwins/656dd74d-8798-4aa4-8d13-6e6458789639/members/34bcee57-2839-471e-8429-7be322fd610d",
      },
      iTwin: {
        href: "https://api.bentley.com/iTwins/656dd74d-8798-4aa4-8d13-6e6458789639",
      },
      imodel: {
        href: "https://api.bentley.com/imodels/881c9ca0-34ff-4875-ae63-2dd8ac015c27",
      },
      group: {
        href: "https://api.bentley.com/savedviews/groups/AOHSBC0rUwdHtXAEp1zmdV9N121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
      },
      image: {
        href: "https://api.bentley.com/savedviews/AGZaq9Y3oQJFvraJLWyEej1N121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw/image?size=full",
      },
      thumbnail: {
        href: "https://api.bentley.com/savedviews/AGZaq9Y3oQJFvraJLWyEej1N121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw/image",
      },
    },
  }, {
    id: "AArIus_4lmtMmu_-3R6qJQ9N121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
    shared: true,
    displayName: "ZoneA 3F",
    tags: [{
      displayName: "3F",
      id: "AGYP_qhEKkdIqtUhqdK8821N121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
    }],
    _links: {
      creator: {
        href: "https://api.bentley.com/iTwins/656dd74d-8798-4aa4-8d13-6e6458789639/members/34bcee57-2839-471e-8429-7be322fd610d",
      },
      iTwin: {
        href: "https://api.bentley.com/iTwins/656dd74d-8798-4aa4-8d13-6e6458789639",
      },
      imodel: {
        href: "https://api.bentley.com/imodels/881c9ca0-34ff-4875-ae63-2dd8ac015c27",
      },
      group: {
        href: "https://api.bentley.com/savedviews/groups/AOHSBC0rUwdHtXAEp1zmdV9N121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
      },
      image: {
        href: "https://api.bentley.com/savedviews/AArIus_4lmtMmu_-3R6qJQ9N121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw/image?size=full",
      },
      thumbnail: {
        href: "https://api.bentley.com/savedviews/AArIus_4lmtMmu_-3R6qJQ9N121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw/image",
      },
    },
  }, {
    id: "AFgGvig5ThdPnVcY0LugAWBN121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
    shared: true,
    displayName: "ZoneE BF",
    tags: [{
      displayName: "Bottom Floor",
      id: "AENRas2DQkZNjs4OnK4qwJNN121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
    }],
    _links: {
      creator: {
        href: "https://api.bentley.com/iTwins/656dd74d-8798-4aa4-8d13-6e6458789639/members/34bcee57-2839-471e-8429-7be322fd610d",
      },
      iTwin: {
        href: "https://api.bentley.com/iTwins/656dd74d-8798-4aa4-8d13-6e6458789639",
      },
      imodel: {
        href: "https://api.bentley.com/imodels/881c9ca0-34ff-4875-ae63-2dd8ac015c27",
      },
      group: {
        href: "https://api.bentley.com/savedviews/groups/AN46P-YXqFxCo0x_hL418vdN121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw",
      },
      image: {
        href: "https://api.bentley.com/savedviews/AFgGvig5ThdPnVcY0LugAWBN121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw/image?size=full",
      },
      thumbnail: {
        href: "https://api.bentley.com/savedviews/AFgGvig5ThdPnVcY0LugAWBN121lmIekSo0TbmRYeJY5oJwciP80dUiuYy3YrAFcJw/image",
      },
    },
  }],
  _links: {
    self: {
      href: "https://api.bentley.com/savedviews?iTwinId=656dd74d-8798-4aa4-8d13-6e6458789639&iModelId=881c9ca0-34ff-4875-ae63-2dd8ac015c27&$top=100",
    },
  },
};
// #endregion Saved Views List
