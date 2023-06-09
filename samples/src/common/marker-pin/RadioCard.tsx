/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React from "react";
import "./RadioCard.scss";

export interface RadioCardEntry {
  image: string;
  value: string;
}

interface RadioCardProps {
  entries: RadioCardEntry[];
  selected: string;
  onChange: ((value: string) => void);
}

/** A React component that renders the UI specific for this component */
export class RadioCard extends React.Component<RadioCardProps, {}> {

  private _onCardSelected = (event: any) => {
    this.props.onChange(event.target.id);
  };

  private createElementsForCard(entry: RadioCardEntry, index: number, entries: RadioCardEntry[]) {
    let divClass = "radio-card card-body";

    if (0 === index) {
      divClass += " card-first";
    } else if (entries.length - 1 === index) {
      divClass += " card-last";
    }

    const isChecked = this.props.selected === entry.value;

    return (
      <>
        <label className="card-radio-btn">
          <input type="radio" name="marker-types" className="card-input-element d-none" id={entry.value} checked={isChecked} onChange={this._onCardSelected} />
          <div className={divClass}>
            <div className="icon icon-status-success marker-pin-selection-icon"></div>
            <img src={entry.image} alt={entry.value} />
          </div>
        </label>
      </>
    );
  }

  public render() {
    return (
      <>
        <div className="radio-cards">
          {this.props.entries.map((entry: RadioCardEntry, index, entries) => this.createElementsForCard(entry, index, entries))}
        </div>
      </>
    );
  }
}
