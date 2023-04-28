/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect, useState } from "react";
import { useActiveIModelConnection } from "@itwin/appui-react";
import { IPropertyDataProvider, PropertyGrid } from "@itwin/components-react";
import { ToggleSwitch } from "@itwin/itwinui-react";
import { KeySet } from "@itwin/presentation-common";
import { useUnifiedSelectionContext } from "@itwin/presentation-components";
import { PropertyFormattingApi } from "./PropertyFormattingApi";

export const PropertyGridComponent = () => {
  const MAX_ELEMENTS = 50;
  const [customized, setCustomized] = useState<boolean>(false);
  const [selectionState, setSelectionState] = useState<{ isOverLimit: boolean, size: number }>({ isOverLimit: false, size: 0 });
  const [dataProvider, setDataProvider] = useState<IPropertyDataProvider>();
  const iModelConnection = useActiveIModelConnection();
  const selectionContext = useUnifiedSelectionContext();

  useEffect(() => {
    if (iModelConnection && selectionContext) {
      const provider = PropertyFormattingApi.createPropertyDataProvider(new KeySet(selectionContext.getSelection()), iModelConnection, customized);
      provider.isNestedPropertyCategoryGroupingEnabled = true;
      provider.keys = new KeySet(selectionContext.getSelection());
      setSelectionState({ isOverLimit: provider.keys.size > MAX_ELEMENTS, size: provider.keys.size });
      setDataProvider(provider);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iModelConnection, selectionContext?.getSelection, customized]);

  return (
    <>
      <ToggleSwitch
        label="Customize dataset"
        checked={customized}
        onChange={() => setCustomized(!customized)}
        disabled={!dataProvider} />
      <div className="sample-selection">
        {dataProvider && !selectionState.isOverLimit && selectionState.size > 0 && <PropertyGrid dataProvider={dataProvider} />}
        {selectionState.isOverLimit && <div className="sample-selection-note">Selected more than allowed maximum of {MAX_ELEMENTS} elements</div>}
        {!selectionState.size && <div className="sample-selection-note">Select an element to see its properties</div>}
      </div>
    </>
  );
};
