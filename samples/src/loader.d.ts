/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
interface CodeShareModules {
  name: string;
  external: boolean;
  version?: string;
}

interface PlayList {
  id: string;
  name: string;
  description: string;
  attributes: string[];
  members: string[];
}

interface Manifest {
  id: string;
  name: string;
  description: string | undefined;
  entryFile: string;
  files: Map<string, () => Promise<string>>;
  optionalFiles: {
    name: string;
    displayName: string;
    version: string;
    files: { name: string, getContent: () => Promise<string> }[];
  }[];
  thumbnail: () => Promise<string>;
  attributes: string[] | undefined;
  iModels: string[] | undefined;
  modules: CodeShareModules[];
  playlists: PlayList[];
}

export declare function getManifest(): Promise<Map<string, Manifest>>;
