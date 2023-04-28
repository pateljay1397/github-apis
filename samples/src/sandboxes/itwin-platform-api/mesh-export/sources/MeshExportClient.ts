/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { IModelApp } from "@itwin/core-frontend";

/**
 * Options for creating a Mesh Export
 * @see {@link https://developer.bentley.com/apis/mesh-export/operations/start-export/#request-body developer.bentley.com}
*/
export interface MeshExportOptions {
  iModelId: string;
  changesetId?: string;
  exportType: "GLTF";
  geometryOptions?: MeshExportGeometryOptions;
  viewDefinitionFilter?: MeshExportViewDefinitionFilter;
}

/**
 * Geometry options for creating a Mesh Export
 * @see {@link https://developer.bentley.com/apis/mesh-export/operations/start-export/#geometryoptions developer.bentley.com}
 */
export interface MeshExportGeometryOptions {
  includeLines?: boolean;
  chordTol?: number;
  angleTol?: number;
  decimationTol?: number;
  maxEdgeLength?: number;
  minBRepFeatureSize?: number;
  minLineStyleComponentSize?: number;
}

/**
 * View filtering options for creating a Mesh Export
 * @see {@link https://developer.bentley.com/apis/mesh-export/operations/start-export#viewdefinitionfilter developer.bentley.com}
 */
export interface MeshExportViewDefinitionFilter {
  models?: string[];
  categories?: string[];
  neverDrawn?: string[];
}

/**
 * Condensed results of a Get Export request
 * @see {@link https://developer.bentley.com/apis/mesh-export/operations/get-export/ developer.bentley.com}
 */
export interface GetMeshExportResult {
  /** @see {@link https://developer.bentley.com/apis/mesh-export/operations/get-export/#exportstatus developer.bentley.com} */
  status: "NotStarted" | "InProgress" | "Complete" | "Invalid";
  /**
   * URL where the result of the export is stored
   * @see {@link https://developer.bentley.com/apis/mesh-export/operations/get-export/#export developer.bentley.com}
   */
  url?: string;
  /**
   * Fabricated URL to download the .GLTF file
   * @see {@link https://developer.bentley.com/apis/mesh-export/operations/get-export/#export developer.bentley.com}
   */
  gltfUrl?: string;
  /**
   * Fabricated URL to download the .BIN file
   * @see {@link https://developer.bentley.com/apis/mesh-export/operations/get-export/#export developer.bentley.com}
   */
  binUrl?: string;
}

/**
 * Client for the Mesh Export API
 * @see {@link https://developer.bentley.com/apis/mesh-export/ developer.bentley.com}
 */
export class MeshExportClient {
  /**
   * Creates a new Mesh Export job
   * @returns id that can be used to query the status of the created Mesh Export job
   * @see {@link https://developer.bentley.com/apis/mesh-export/operations/start-export/ developer.bentley.com}
   */
  public static async startExport(options: MeshExportOptions): Promise<string> {
    const accessToken = await IModelApp.authorizationClient?.getAccessToken();
    if (!accessToken)
      throw new Error("Failed to acquire a valid accessToken.");

    const response = await fetch("https://api.bentley.com/mesh-export/", {
      body: JSON.stringify(options),
      method: "POST",
      headers: {
        "Accept": "application/vnd.bentley.itwin-platform.v1+json",
        "Authorization": accessToken,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok)
      throw new Error(response.statusText);

    const body = await response.json();
    const exportId = body?.export?.id;
    if (exportId === undefined)
      throw new Error("Start Export did not return an export id");

    return exportId;
  }

  /**
   * Query the status of a Mesh Export job
   * @param exportId id a job that was previously created using Start Export
   * @see {@link https://developer.bentley.com/apis/mesh-export/operations/get-export/ developer.bentley.com}
   */
  public static async getExport(exportId: string): Promise<GetMeshExportResult> {
    const accessToken = await IModelApp.authorizationClient?.getAccessToken();
    if (!accessToken)
      throw new Error("Failed to acquire a valid accessToken.");

    const response = await fetch(`https://api.bentley.com/mesh-export/${exportId}`, {
      method: "GET",
      headers: {
        Accept: "application/vnd.bentley.itwin-platform.v1+json",
        Authorization: accessToken,
      },
    });

    if (!response.ok)
      throw new Error(response.statusText);

    const body = await response.json();
    const status = body?.export?.status;
    if (status === undefined)
      throw new Error("Get Export did not return an export status");

    const containerUrl: string | undefined = body?.export?._links?.mesh?.href;
    if (containerUrl === undefined)
      return { status };

    const sas = containerUrl.split("?");
    const gltfUrl = `${sas[0]}/Export.gltf?${sas[1]}`;
    const binUrl = `${sas[0]}/Export.bin?${sas[1]}`;
    return { status, url: body?.export?._links?.mesh?.href, gltfUrl, binUrl };
  }
}
