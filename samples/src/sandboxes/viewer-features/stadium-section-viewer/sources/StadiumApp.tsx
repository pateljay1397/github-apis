/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useState } from "react";
import { Alert, Headline, ProgressRadial, Surface } from "@itwin/itwinui-react";
import { GameDetails } from "./GameDetails";
import { StadiumViewer } from "./StadiumViewer";
import logo from "./Team_logo.png";
import "./StadiumApp.scss";

const StadiumApp = () => {

  // The application outside the viewer can not reference IModelApp until the viewer component has created it.
  // Due to that we wait for the IModelConnection to be created with a callback rather than checking the IModelApp it's self,
  // or using the built in useActveIModelConnection hook.

  const [iModelConnected, setIModelConnected] = useState(false);

  return (
    <div className="wrapper">
      <div className="team-banner">
        <img src={logo} alt="Team Logo" />
        <Headline>GREAT LAKERS</Headline>
      </div>
      <div className="app-ui">
        {iModelConnected ? <Surface className="game-details">{<GameDetails />}</Surface> :
          <Surface className="spinner"><ProgressRadial indeterminate={true} size="large"></ProgressRadial></Surface>}
        <div className="model-view">
          {<StadiumViewer onIModelConnected={() => setIModelConnected(true)} />}
          <Alert type="informational" className="custom-alert">Check out the view from your seat</Alert>
        </div>
      </div>
    </div>
  );

};

export default StadiumApp;
