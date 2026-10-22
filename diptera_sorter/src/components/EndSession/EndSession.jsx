import React, {useContext, useEffect, useState} from "react";
import "./style.css";
import "../HandleStop/style.css";
import {createPortal} from "react-dom";
import {Button} from "../Button/index.js";
import {SelectedMachinesContext} from "../SelectedMachinesContext/SelectedMachinesContext.jsx";
import {DataContext} from "../../communication/DataContext.jsx";


export const EndSession = ({onFinishSession, session, presentation = "inline"}) => {
    const [stage, setStage] = useState("confirm"); // "confirm" or "reminder"
    const {
        stopSessionRequest,
        setStopSessionRequest,
    } = useContext(SelectedMachinesContext);
    const {
        endSession,
        sendCommand
    } = useContext(DataContext);
    const handleYes = () => {
        setStage("reminder");
        finishSession();
    };
    const finishSession = () => {
        endSession(session.session_id)
    }

    const handleContinue = () => {
        sendCommand("wash_end_session", session.machine_ids, [session.session_id]);
        setStopSessionRequest(prev => prev.filter(id => id !== session.session_id));
    };

    const handleCancel = () => {
        if (stopSessionRequest.includes(session.session_id)) {
            setStopSessionRequest(prev => prev.filter(id => id !== session.session_id));
        }
    };

    if (presentation === "dialog") {
        return createPortal(
            <div className="master-stop-overlay">
                <div className="master-stop-dialog" role="dialog" aria-modal="true"
                     aria-labelledby={`stop-session-title-${session.session_id}`}
                     aria-describedby={`stop-session-description-${session.session_id}`}>
                    <h2 id={`stop-session-title-${session.session_id}`}>Stop session {session.session_title}</h2>
                    <p id={`stop-session-description-${session.session_id}`}>
                        {stage === "confirm"
                            ? `Are you sure you want to stop machines ${session.machine_ids.join(", ")} in this session?`
                            : `Please replace the larvae bottles with clean water in machines ${session.machine_ids.join(", ")} before continuing.`}
                    </p>
                    <div className="master-stop-actions">
                        {stage === "confirm" && <button type="button" onClick={handleCancel} autoFocus>Cancel</button>}
                        <button type="button" className="master-stop-primary"
                                onClick={stage === "confirm" ? handleYes : handleContinue}>
                            {stage === "confirm" ? "Stop" : "Continue"}
                        </button>
                    </div>
                </div>
            </div>, document.body
        );
    }

    return (
        <div className="exit-session-overlay">
            <div className="exit-session-window">
                {stage === "confirm" && (
                    <>
                        <h2>Are you sure you want to exit the session : {session.session_title}?</h2>
                        <div className="exit-session-buttons">
                            <Button onClick={handleCancel} text={"Cancel"}></Button>
                            <Button onClick={handleYes} text={`Yes, stop machines: ${session.machine_ids}`} once={true}></Button>
                        </div>
                    </>
                )}
                {stage === "reminder" && (
                    <>
                        <h2>Make sure you put clean water instead of larvae in machines {session.machine_ids}</h2>
                        <div className="exit-session-buttons">
                            <Button onClick={handleContinue} text={"Continue"} once={true}></Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};