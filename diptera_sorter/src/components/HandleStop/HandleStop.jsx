import React, {useContext, useState, useEffect, useRef} from "react";
import {createPortal} from "react-dom";
import {Button} from "../Button/index.js";
import {DataContext} from "../../communication/DataContext.jsx"; // adjust import if needed
import "./style.css"
function HandleStopRow({machine_id, setStopRequest, presentation = "inline"}) {
    const dialogRef = useRef(null);
    const {
        sendCommand,
        liveData,
        removeMachine
    } = useContext(DataContext);

    const [stage, setStage] = useState("confirm"); // "confirm", "normal", "done"

    const handleCancel = () => {
        setStopRequest(prev => prev.filter(id => id !== machine_id));
    };

    useEffect(() => {
        if (presentation !== "dialog") return;
        const previousFocus = document.activeElement;
        const dialog = dialogRef.current;
        dialog?.querySelector("button")?.focus();
        const onKeyDown = (event) => {
            if (event.key === "Escape") {
                event.preventDefault();
                setStopRequest(prev => prev.filter(id => id !== machine_id));
            }
            if (event.key === "Tab" && dialog) {
                const buttons = [...dialog.querySelectorAll("button")];
                const first = buttons[0];
                const last = buttons[buttons.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last?.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first?.focus();
                }
            }
        };
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            previousFocus?.focus();
        };
    }, [presentation, machine_id, setStopRequest]);

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

    if (presentation === "dialog") {
        return createPortal(
            <div className="master-stop-overlay" onClick={handleCancel}>
                <div className="master-stop-dialog" ref={dialogRef} role="dialog" aria-modal="true"
                     aria-labelledby={`stop-title-${machine_id}`} aria-describedby={`stop-description-${machine_id}`}
                     onClick={event => event.stopPropagation()}>
                    <h2 id={`stop-title-${machine_id}`}>Stop Machine {machine_id}</h2>
                    <p id={`stop-description-${machine_id}`}>
                        {stage === "confirm"
                            ? "Are you sure you want to stop this machine?"
                            : "Please replace the larvae bottle with clean water before continuing."}
                    </p>
                    <div className="master-stop-actions">
                        <button type="button" onClick={handleCancel}>Cancel</button>
                        <button type="button" className="master-stop-primary"
                                onClick={stage === "confirm" ? handleNormalStop : handleContinue}>
                            {stage === "confirm" ? "Stop" : "Continue"}
                        </button>
                    </div>
                </div>
            </div>, document.body
        );
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
