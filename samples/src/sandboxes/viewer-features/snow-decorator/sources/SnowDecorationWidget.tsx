/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { useEffect } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { useActiveViewport } from "@itwin/appui-react";
import { Alert, Button, Label, LabeledSelect, Slider, ToggleSwitch } from "@itwin/itwinui-react";
import SnowDecorationApi from "./SnowDecorationApi";
import { SnowParams } from "./SnowDecorator";
import "./SnowDecoration.scss";

const windRange = 600;

const SnowDecorationWidget = () => {
  const viewport = useActiveViewport();
  const [propsName, setPropsName] = React.useState<string>(SnowDecorationApi.predefinedProps.keys().next().value);
  const [wind, setWind] = React.useState<number>(0);
  const [particleDensity, setParticleDensity] = React.useState<number>(0);
  const [pauseEffect, setPauseEffect] = React.useState<boolean>(false);

  useEffect(() => {
    if (!viewport)
      return;

    const props = SnowDecorationApi.predefinedProps.get(propsName)!;
    SnowDecorationApi.createSnowDecorator(viewport, props).then(() => {
      setParticleDensity(props.params.particleDensity);
      setWind(props.params.windVelocity);
      setPauseEffect(false);
    })
      .catch((error) => {
        console.error(error);
      });
  }, [viewport, propsName]);

  useEffect(() => {
    configureEffect({ particleDensity });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [particleDensity]);

  useEffect(() => {
    configureEffect({ windVelocity: wind });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wind]);

  useEffect(() => {
    configureEffect({ pauseEffect });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pauseEffect]);

  /** Configures active snow decorators (should only ever be one in this sample). */
  const configureEffect = (params: Partial<SnowParams> & { pauseEffect?: boolean }) => {
    SnowDecorationApi.getSnowDecorators().forEach((decorator) => {
      // if there is an update to the, a texture may need to be updated too.
      if (params.windVelocity !== undefined) {
        const prevWind = decorator.getParams().windVelocity;
        // test if the wind has changed
        if (params.windVelocity !== prevWind) {
          // test if the texture has changed
          const url = SnowDecorationApi.testForTextureUpdate(propsName, params.windVelocity, prevWind);
          if (url) {
            // Set new texture
            SnowDecorationApi.allocateTextureFromUrl(url).then((texture) => {
              decorator.changeTexture(texture);
            })
              .catch((error) => {
                // eslint-disable-next-line no-console
                console.error(error);
              });
          }
        }
      }
      // Update if it is paused.
      if (params.pauseEffect !== undefined)
        decorator.pause = params.pauseEffect;
      // Configure the decorator
      decorator.configure(params);
    });
  };

  const options = [...SnowDecorationApi.predefinedProps.keys()].map((key) => ({ value: key, label: key }));

  // Display drawing and sheet options in separate sections.
  return (
    <div className="sample-options">
      <div className="sample-grid">
        <LabeledSelect label="Select Effect" className="effect" options={options} value={propsName} onChange={setPropsName} size="small" />
        <ToggleSwitch label="Pause Effect" checked={pauseEffect} onChange={() => setPauseEffect(!pauseEffect)} />
        <div className="particle">
          <Label>Particle Density</Label>
          <Slider min={0} max={0.01135} step={0.0001} values={[particleDensity]} onUpdate={(values) => setParticleDensity(values[0])} />
        </div>
        <div className="wind">
          <div>
            <Label>Wind</Label>
            <Slider min={-windRange} max={windRange} values={[wind]} step={0.25} onUpdate={(values) => setWind(values[0])} />
          </div>
          <Button size="small" onClick={() => setWind(0)}>Reset</Button>
        </div>
      </div>
      <Alert type="informational" className="instructions">
        Apply particle effects to the model
      </Alert>
    </div>
  );
};

export class SnowDecorationWidgetProvider implements UiItemsProvider {
  public readonly id: string = "SnowDecorationWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Bottom) {
      widgets.push(
        {
          id: "SnowDecorationWidget",
          label: "Snow Decoration Selector",
          defaultState: WidgetState.Open,
          getWidgetContent: () => <SnowDecorationWidget />,
        }
      );
    }
    return widgets;
  }
}
