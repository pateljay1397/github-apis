/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect, useState } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { useActiveIModelConnection } from "@itwin/appui-react";
import { Alert, Button, Label, LabeledSelect, SelectOption, Small, TagContainer, toaster } from "@itwin/itwinui-react";
import { IotAlert } from "./IotAlert";
import { Entity } from "./IotAlertApi";
import "./IotAlert.scss";

const _classList: SelectOption<string>[] = [
  { label: "SHELL_AND_TUBE_HEAT_EXCHANGER_PAR", value: "SHELL_AND_TUBE_HEAT_EXCHANGER_PAR" },
  { label: "VERTICAL_VESSEL_PAR", value: "VERTICAL_VESSEL_PAR" },
  { label: "PLATE_TYPE_HEAT_EXCHANGER", value: "PLATE_TYPE_HEAT_EXCHANGER" },
  { label: "REBOILER_PAR", value: "REBOILER_PAR" },
];

const IotAlertWidget = () => {
  const iModelConnection = useActiveIModelConnection();
  const [selectedClass, setSelectedClass] = React.useState<string>(_classList[0].value);
  const [selectedElementId, setSelectedElementId] = React.useState<string>();
  const [entities, setEntities] = useState<Record<string, Entity[]>>({});
  const [alerts, setAlerts] = React.useState<IotAlert[]>([]);

  useEffect(() => {
    async function initialize() {
      if (!iModelConnection)
        return;

      const queriedEntities: Record<string, Entity[]> = {};
      for (const { value: className } of _classList) {
        const rows: Entity[] = [];
        const query = `SELECT EcInstanceId, userLabel FROM ProcessPhysical.${className}`;
        for await (const row of iModelConnection.query(query)) {
          rows.push({ id: row[0], label: row[1] });
        }
        queriedEntities[className] = rows;
      }

      setEntities(queriedEntities);
      setSelectedElementId(queriedEntities[selectedClass][0].id);
    }

    initialize().catch((error) => console.error(error));
  }, [iModelConnection, selectedClass]);

  const onCreateAlert = () => {
    if (selectedElementId) {
      const label = Object.values(entities)
        .flat()
        .find((e) => e.id === selectedElementId)?.label;

      const alert = new IotAlert(selectedElementId, label);
      alert.display();
      setAlerts([...alerts, alert]);
    }
  };

  const onClearAllAlerts = () => {
    alerts.forEach((alert) => alert.remove());
    setAlerts([]);
    toaster.closeAll();
  };

  const onClassChange = (className: string) => {
    setSelectedClass(className);
    setSelectedElementId(entities[className][0].id);
  };

  const removeAlert = (entityId: string) => {
    const alert = alerts.find((item) => item.elementId === entityId);
    if (alert) {
      alert.remove();
      setAlerts(alerts.filter((f) => f.elementId !== alert.elementId));
    }
  };

  const enableCreateAlertButton = selectedElementId && !alerts.map((m) => m.elementId).includes(selectedElementId);

  const getEntityOptions = (): SelectOption<string>[] => {
    return entities[selectedClass]
      ? entities[selectedClass].map((entity) => ({ value: entity.id, label: entity.label }))
      : [];
  };

  return (
    <div className="sample-options">
      <div className="sample-grid">
        <LabeledSelect label="Pick class:" value={selectedClass} options={_classList} onChange={onClassChange} disabled={!iModelConnection} />
        <LabeledSelect label="Pick element:" value={selectedElementId} options={getEntityOptions()} onChange={setSelectedElementId} disabled={!iModelConnection} />
        <div className="sample-buttons">
          <Button styleType="high-visibility" onClick={onCreateAlert} disabled={!enableCreateAlertButton}>Create Alert</Button>
          <Button onClick={onClearAllAlerts} disabled={alerts.length === 0}>Clear all Alerts</Button>
        </div>
      </div>
      <div className="active-alerts">
        <Label>Active Alert(s)</Label>
        <TagContainer>
          {!alerts.length && <Small>There are no alerts yet</Small>}
          {alerts.map((alert, index) => alert.render(index, removeAlert))}
        </TagContainer>
      </div>
      <Alert type="informational" className="instructions">
        Use the picker to choose an element class and instance. Then click the "Create" button to trigger an alert.
      </Alert>
    </div>
  );
};

export class IotAlertWidgetProvider implements UiItemsProvider {
  public readonly id: string = "IotAlertWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Bottom) {
      widgets.push(
        {
          id: "IotAlertWidget",
          label: "Iot Alerts",
          defaultState: WidgetState.Open,
          getWidgetContent: () => <IotAlertWidget />,
        }
      );
    }
    return widgets;
  }
}
