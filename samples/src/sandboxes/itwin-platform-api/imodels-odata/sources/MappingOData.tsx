/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { Alert, Code, LabeledSelect, Table, ToggleSwitch } from "@itwin/itwinui-react";
import { Column } from "react-table";
import * as React from "react";
import { useActiveIModelConnection } from "@itwin/appui-react";
import { EmphasizeElements, IModelApp } from "@itwin/core-frontend";
import { OData } from "./OData";
import { ReportingClient } from "@itwin/insights-client";
import "./MappingOData.scss";

const fetchOData = async (
  iModelId: string,
  changeset: string,
  mappingId: string,
  groupName: string,
  setColumns: React.Dispatch<React.SetStateAction<Column<any>[]>>,
  setData: React.Dispatch<React.SetStateAction<any[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const url = `https://api.bentley.com/insights/imodels-odata/${iModelId}/changesets/${changeset}/mappings/${mappingId}/odata`;
  const requestInit = {
    headers: new Headers({
      Authorization: await IModelApp.authorizationClient!.getAccessToken(),
    }),
  };
  const odata = new OData(url, requestInit);
  const odataResponse = await odata.get(groupName);

  setColumns([
    {
      Header: "Header name",
      columns: Object.keys(odataResponse[0]).map((x) => ({
        id: x,
        Header: x,
        accessor: x,
        width: 200,
      })),
    },
  ]);
  setData(odataResponse);
  setIsLoading(false);
};

const fetchGroups = async (
  iModelId: string,
  changeset: string,
  mappingId: string,
  setGroups: React.Dispatch<React.SetStateAction<any[]>>,
  setSelectGroup: React.Dispatch<React.SetStateAction<string | undefined>>
) => {
  const url = `https://api.bentley.com/insights/imodels-odata/${iModelId}/changesets/${changeset}/mappings/${mappingId}/odata`;
  const config = {
    headers: new Headers({
      Authorization: await IModelApp.authorizationClient!.getAccessToken(),
    }),
  };
  const odata = new OData(url, config);
  const odataResponse = await odata.get();

  setGroups(odataResponse.map((x: any) => ({ value: x.url, label: x.name })));

  if (odataResponse.length > 0) {
    setSelectGroup(odataResponse[0].url);
  }
};

const fetchMappings = async (
  iModelId: string,
  setMappings: React.Dispatch<React.SetStateAction<any[]>>,
  setSelectMapping: React.Dispatch<React.SetStateAction<string | undefined>>
) => {
  const reportingClient = new ReportingClient();
  const accessToken = await IModelApp.authorizationClient!.getAccessToken();

  const mappings = await reportingClient.getMappings(accessToken, iModelId);

  setMappings(mappings.map((x: any) => ({ value: x.id, label: x.mappingName })));

  if (mappings.length > 0) {
    setSelectMapping(mappings[0].id);
  }
};

export const MappingOData = () => {
  const iModelId = useActiveIModelConnection()?.iModelId as string;
  const changeset = useActiveIModelConnection()?.changeset.id as string;

  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [applyZoom, setApplyZoom] = React.useState<boolean>(true);
  const [mappings, setMappings] = React.useState<any[]>([]);
  const [groups, setGroups] = React.useState<any[]>([]);
  const [odata, setOData] = React.useState<any[]>([]);
  const [columns, setColumns] = React.useState<Column<any>[]>([]);

  const [selectMapping, setSelectMapping] = React.useState<string>();
  const [selectGroup, setSelectGroup] = React.useState<string>();

  React.useEffect(() => {
    void fetchMappings(iModelId, setMappings, setSelectMapping);
  }, [iModelId]);

  React.useEffect(() => {
    if (selectMapping !== undefined) {
      void fetchGroups(iModelId, changeset, selectMapping, setGroups, setSelectGroup);
    }
  }, [iModelId, changeset, selectMapping]);

  React.useEffect(() => {
    if (selectMapping !== undefined && selectGroup !== undefined) {
      void fetchOData(iModelId, changeset, selectMapping, selectGroup, setColumns, setOData, setIsLoading);
    }
  }, [iModelId, changeset, selectMapping, selectGroup]);

  const onSelect = React.useCallback(async (selectedData: any[] | undefined) => {
    if (!IModelApp.viewManager.selectedView) {
      return;
    }
    const hasSelection = selectedData !== undefined && selectedData.length > 0;

    const vp = IModelApp.viewManager.selectedView;
    const emph = EmphasizeElements.getOrCreate(vp);
    emph.clearEmphasizedElements(vp);
    emph.wantEmphasis = hasSelection;

    if (hasSelection) {
      const selected = selectedData.map((x: any) => (x.ECInstanceId as string));
      emph.emphasizeElements(selected, vp);
      if (applyZoom) {
        await vp.zoomToElements(selected, { animateFrustumChange: true });
      }
    }
  }, [applyZoom]);

  return (
    <div className="mapping-odata-sample">
      <div className="mapping-group-selection">
        <LabeledSelect
          label="Select Mapping"
          displayStyle="inline"
          options={mappings}
          value={selectMapping}
          onChange={(value) => { setSelectMapping(value); setOData([]); setIsLoading(true); }}
          onShow={undefined}
          onHide={undefined}
        />
        <LabeledSelect
          label="Select Group"
          displayStyle="inline"
          options={groups}
          value={selectGroup}
          onChange={(value) => { setSelectGroup(value); setOData([]); setIsLoading(true); }}
          onShow={undefined}
          onHide={undefined}
        />
        <ToggleSwitch
          label="Zoom to Selection"
          labelPosition="left"
          defaultChecked
          onChange={() => setApplyZoom(!applyZoom)}
        />
      </div>
      <div className="odata-table">
        <Table
          columns={columns}
          data={odata}
          emptyTableContent="No data."
          isLoading={isLoading}
          isSortable={false}
          isSelectable={true}
          onSelect={onSelect}
          density="extra-condensed"
        />
      </div>
      <Alert type="informational" className="instructions">
        Choose a Mapping from <Code>Select Mapping</Code> dropdown and a Group from <Code>Select Group</Code> dropdown.
        Click on any table row to highlight and zoom to the element in the viewer.
        Toggle <Code>Zoom to Selection</Code> to enable/disable zoom.
      </Alert>
    </div>
  );
};
