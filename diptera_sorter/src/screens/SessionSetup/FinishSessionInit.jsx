import React from "react";
import {Button} from "../../components/Button/index.js";
import "./style.css";

export const FinishSessionInit = ({startSession}) => {
    return (
        <div className="session-setup">
            <div className="text-wrapper">Setup successful</div>
            <Button
                className="butten-instance"
                divClassName="design-component-instance-node"
                text="START"
                onClick={startSession}
                once={true}
            />
        </div>
    );
};
