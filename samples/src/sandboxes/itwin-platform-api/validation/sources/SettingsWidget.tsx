/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { useActiveIModelConnection } from "@itwin/appui-react";
import { imageElementFromUrl } from "@itwin/core-frontend";
import { Alert, Button, ToggleSwitch } from "@itwin/itwinui-react";
import markerPinImage from "./common/marker-pin/marker-pin.svg";
import { MarkerData, MarkerPinDecorator } from "./common/marker-pin/MarkerPinDecorator";
import ValidationApi from "./ValidationApi";
import "./ValidationReview.scss";

const SettingsWidget = () => {
  const iModelConnection = useActiveIModelConnection();
  const [validationResults, setValidationResults] = React.useState<any>();
  const [ruleData, setRuleData] = React.useState<any>();
  const [markersData, setMarkersData] = React.useState<MarkerData[]>();
  const [image, setImage] = React.useState<HTMLImageElement>();
  const [showDecorator, setShowDecorator] = React.useState<boolean>(true);
  const [validationDecorator] = React.useState<MarkerPinDecorator>(() => {
    return ValidationApi.setupDecorator();
  });

  useEffect(() => {
    imageElementFromUrl(markerPinImage)
      .then((img: any) => setImage(img))
      .catch((error: any) => console.error(error));
  }, []);

  /** Initialize Decorator */
  useEffect(() => {
    ValidationApi.enableDecorations(validationDecorator);
    return () => {
      ValidationApi.disableDecorations(validationDecorator);
    };
  }, [validationDecorator]);

  useEffect(() => {
    if (showDecorator)
      ValidationApi.enableDecorations(validationDecorator);
    else
      ValidationApi.disableDecorations(validationDecorator);
  }, [showDecorator, validationDecorator]);

  useEffect(() => {
    const removeListener = ValidationApi.onRunIdChanged.addListener((resultId: string | undefined) => {
      if (!resultId) {
        setValidationResults(undefined);
        setRuleData(undefined);
      } else {
        ValidationApi.setValidationResults(resultId)
          .catch((error) => {
            console.error(error);
          });
      }
    });
    return () => {
      removeListener();
    };
  }, []);

  useEffect(() => {
    /** Create a listener that responds to validation data retrieval */
    const removeListener = ValidationApi.onResultsDataChanged.addListener((value: any) => {
      setValidationResults(value ? value.resultsData : undefined);
      setRuleData(value ? value.resultRules : undefined);
    });

    return () => {
      removeListener();
    };
  }, []);

  /** When the validation data comes in, get the marker data */
  useEffect(() => {
    if (iModelConnection && validationResults && ruleData) {
      ValidationApi.getValidationMarkersData(iModelConnection, validationResults, ruleData).then((mData) => {
        setMarkersData(mData);
      }).catch((error) => {
        console.error(error);
      });
    }
  }, [iModelConnection, validationResults, ruleData]);

  useEffect(() => {
    if (markersData && image) {
      ValidationApi.setDecoratorPoints(markersData, validationDecorator, image);
    }
    setShowDecorator(true);
  }, [markersData, image, validationDecorator]);

  return (
    <>
      <div className="sample-options">
        <Alert type="informational" className="sample-options-block no-icon">
          <strong>Tests</strong> - Select one of the validation tests to show the related runs.
        </Alert>
        <Alert type="informational" className="sample-options-block no-icon">
          <strong>Runs</strong> - Select one of the test runs to review the validation results.
        </Alert>
        <Alert type="informational" className="sample-options-block no-icon">
          <strong>Validation Results</strong> - Click a marker or validation result to review issues.
        </Alert>
        <ToggleSwitch label="Show Markers" checked={showDecorator} onChange={() => setShowDecorator(!showDecorator)} className="sample-options-block"></ToggleSwitch>
        <Button size="small" styleType="high-visibility" onClick={ValidationApi.resetDisplay} className="sample-options-button">Reset Display</Button>
      </div>
    </>
  );
};

export class SettingsWidgetProvider implements UiItemsProvider {
  public readonly id: string = "SettingsWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right && _section === StagePanelSection.Start) {
      widgets.push(
        {
          id: "SettingsWidget",
          label: "SettingsWidget",
          defaultState: WidgetState.Open,
          getWidgetContent: () => <SettingsWidget />,
        }
      );
    }
    return widgets;
  }
}
