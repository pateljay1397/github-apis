/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useCallback, useEffect } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { useActiveIModelConnection, useActiveViewport } from "@itwin/appui-react";
import { Id64String } from "@itwin/core-bentley";
import { SpatialClassifier, SpatialClassifierFlags, SpatialClassifierInsideDisplay, SpatialClassifierOutsideDisplay } from "@itwin/core-common";
import { IModelApp } from "@itwin/core-frontend";
import { Alert, Input, Label, Select, SelectOption } from "@itwin/itwinui-react";
import { KeySet } from "@itwin/presentation-common";
import { ISelectionProvider, SelectionChangeEventArgs } from "@itwin/presentation-frontend";
import ClassifierApi from "./ClassifierApi";
import { ClassifierProperties } from "./ClassifierProperties";
import "./Classifier.scss";

const ClassifierWidget = () => {
  const _insideDisplayEntries: SelectOption<number>[] = [
    { value: SpatialClassifierInsideDisplay.ElementColor, label: "Element Color" },
    { value: SpatialClassifierInsideDisplay.Off, label: "Off" },
    { value: SpatialClassifierInsideDisplay.On, label: "On" },
    { value: SpatialClassifierInsideDisplay.Dimmed, label: "Dimmed" },
    { value: SpatialClassifierInsideDisplay.Hilite, label: "Hilite" },
  ];

  const _outsideDisplayEntries: SelectOption<number>[] = [
    { value: SpatialClassifierOutsideDisplay.Off, label: "Off" },
    { value: SpatialClassifierOutsideDisplay.On, label: "On" },
    { value: SpatialClassifierOutsideDisplay.Dimmed, label: "Dimmed" },
  ];

  const iModelConnection = useActiveIModelConnection();
  const viewport = useActiveViewport();
  const [initialized, setInitialized] = React.useState<boolean>(false);
  const [classifiers, setClassifiers] = React.useState<SelectOption<Id64String>[]>([]);
  const [currentClassifier, setCurrentClassifier] = React.useState<string>();
  const [expandDistState, setExpandDistState] = React.useState<number>(3);
  const [outsideDisplayKeyState, setOutsideDisplayKeyState] = React.useState<number>(SpatialClassifierOutsideDisplay.Dimmed);
  const [insideDisplayKeyState, setInsideDisplayKeyState] = React.useState<number>(SpatialClassifierInsideDisplay.ElementColor);
  const [keysState, setKeysState] = React.useState<KeySet>(new KeySet());

  /**
  * This callback will be executed by once the iModel and view has been loaded.
  * The reality model will default to on.
  */
  useEffect(() => {
    if (iModelConnection) {
      ClassifierApi.addSelectionListener(_onSelectionChanged);
    }

    /** Turn on RealityData and initialize the classifierState */
    if (!initialized && viewport && iModelConnection) {
      ClassifierApi.turnOnAvailableRealityModel(viewport, iModelConnection).then(() => {
        ClassifierApi.getAvailableClassifierListForViewport(viewport).then((_classifiers) => {
          const commercialModelId = _classifiers[0].value;
          setClassifiers(_classifiers);
          setCurrentClassifier(commercialModelId);
        })
          .catch((error) => {
            // eslint-disable-next-line no-console
            console.error(error);
          });
      })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error);
        });

      setInitialized(true);
    }

    /** On Widget deletion, remove the selection listener */
    return () => {
      ClassifierApi.removeSelectionListener();
    };
  }, [iModelConnection, viewport, initialized]);

  /*
  * Get property values for the classifier.
  */
  const getClassifierValues = useCallback((modelId: string): SpatialClassifier => {
    const flags = new SpatialClassifierFlags(
      insideDisplayKeyState,
      outsideDisplayKeyState,
      false
    );

    const classifier: SpatialClassifier = new SpatialClassifier(
      modelId,
      `${modelId}`,
      flags,
      expandDistState
    );

    return classifier;
  }, [expandDistState, insideDisplayKeyState, outsideDisplayKeyState]);

  useEffect(() => {
    const vp = IModelApp.viewManager.selectedView;
    setKeysState(new KeySet());
    if (vp) {
      const classifier: SpatialClassifier = getClassifierValues(currentClassifier!);
      ClassifierApi.updateRealityDataClassifiers(vp, classifier);
    }
  }, [currentClassifier, getClassifierValues]);

  /** When the user selects an element, grab the keys */
  const _onSelectionChanged = async (evt: SelectionChangeEventArgs, selectionProvider: ISelectionProvider) => {
    const selection = selectionProvider.getSelection(evt.imodel, evt.level);
    const keys = new KeySet(selection);
    setKeysState(keys);
  };

  // Some reasonable defaults depending on what classifier is chosen.
  const _onClassifierChange = (value: string): void => {
    const selectedOption: SelectOption<string> | undefined = classifiers.find((x) => x.value === value);
    if (selectedOption) {
      if (selectedOption.label.includes("Buildings")) {
        setInsideDisplayKeyState(SpatialClassifierInsideDisplay.On);
        setExpandDistState(3.5);
      }
      if (selectedOption.label.includes("Streets")) {
        setInsideDisplayKeyState(SpatialClassifierInsideDisplay.Hilite);
        setExpandDistState(2);
      }
      if (selectedOption.label.includes("Commercial")) {
        setInsideDisplayKeyState(SpatialClassifierInsideDisplay.ElementColor);
        setExpandDistState(1);
      }
      if (selectedOption.label.includes("Street Poles")) {
        setInsideDisplayKeyState(SpatialClassifierInsideDisplay.Hilite);
        setExpandDistState(1);
      }

      setCurrentClassifier(value);
      setOutsideDisplayKeyState(SpatialClassifierOutsideDisplay.Dimmed);
    }
  };

  const _onMarginChange = (event: any) => {
    try {
      const expandDist = parseFloat(event.target.value);
      setExpandDistState(expandDist);
    } catch { }
  };

  const _onOutsideDisplayChange = (value: number): void => {
    setOutsideDisplayKeyState(value);
  };

  const _onInsideDisplayChange = (value: number): void => {
    setInsideDisplayKeyState(value);
  };

  return (
    <div className="sample-options">
      <div className="sample-options-container">
        <div>
          <Alert type="informational" className="instructions">
            Use controls below to create a classifier.
          </Alert>
          <div className="sample-options-2col" >
            <Label htmlFor="classifier">Select classifier:</Label>
            <Select<string> id="classifier" size="small" className="classification-dialog-select" value={currentClassifier} options={classifiers} onChange={_onClassifierChange} />
            <Label htmlFor="margin">Margin:</Label>
            <Input id="margin" size="small" type="number" min="0" max="100" value={expandDistState} onChange={_onMarginChange} />
            <Label htmlFor="outside-display">Outside Display:</Label>
            <Select<number> id="outside-display" size="small" options={_outsideDisplayEntries} value={outsideDisplayKeyState} onChange={_onOutsideDisplayChange} />
            <Label htmlFor="inside-display">Inside Display:</Label>
            <Select<number> id="inside-display" size="small" options={_insideDisplayEntries} value={insideDisplayKeyState} onChange={_onInsideDisplayChange} />
          </div>
        </div>
        <ClassifierProperties keys={keysState} imodel={iModelConnection} />
      </div>
    </div>
  );
};

export class ClassifierWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ClassifierWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "ClassifierWidget",
          label: "Classifier Selector",
          defaultState: WidgetState.Open,
          getWidgetContent: () => <ClassifierWidget />,
        }
      );
    }
    return widgets;
  }
}
