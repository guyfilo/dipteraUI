import React, {useContext, useState} from "react";
import {Button} from "../Button/index.js";
import {DataContext} from "../../communication/DataContext.jsx"; // adjust import if needed
import "./style.css"
function HandleStopRow({machine_id, setStopRequest}) {
    const {
        sendCommand,
        liveData,
        removeMachine
    } = useContext(DataContext);

    const [stage, setStage] = useState("confirm"); // "confirm", "normal", "done"

    const handleCancel = () => {
        setStopRequest(prev => prev.filter(id => id !== machine_id));
    };

    const handleNormalStop = () => {
        setStage("normal");
    };

    const handleContinue = () => {
        setStopRequest(prev => prev.filter(id => id !== machine_id));
        sendCommand("wash_end_session", [machine_id] ,[]);
    };
    if (Object.keys(liveData).includes(machine_id) && ["Stop", "Killed"].includes(liveData[machine_id].machine_state)){
        sendCommand("stop", [machine_id], []);
        return;
    }

    return (
        <>
            <div className="stop-handle">
                {stage === "confirm" && (
                    <>
                        <div >Are you sure you want to stop the machine?</div>
                        <Button text="Cancel" className="handle-error-button" once={true} onClick={handleCancel}/>
                        <Button text="Stop" className="handle-error-button" once={true} onClick={handleNormalStop}/>
                    </>
                )}
                {stage === "normal" && (
                    <>
                        <div >
                            Please replace the larvae bottle with clean water before continuing.
                        </div>
                        <Button text="Continue" className="handle-error-button" once={true} onClick={handleContinue}/>
                    </>
                )}
            </div>
        </>
    );
}

export default HandleStopRow;
