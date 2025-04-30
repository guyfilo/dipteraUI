import React, {useContext, useEffect, useState} from "react";
import "./style.css";
import {Button} from "../Button/index.js";


export const EndSession = ({onFinishSession, onCancel, onReady, session}) => {
    const [stage, setStage] = useState("confirm"); // "confirm" or "reminder"

    const handleYes = () => {
        setStage("reminder");
        if (onFinishSession) {
            onFinishSession();
        }
    };

    const handleContinue = () => {
        if (onReady) {
            onReady();
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
    };
    console.log(session);

    return (
        <div className="exit-session-overlay">
            <div className="exit-session-window">
                {stage === "confirm" && (
                    <>
                        <h2>Are you sure you want to exit the session : {session.session_title}?</h2>
                        <div className="exit-session-buttons">
                            <Button onClick={handleCancel} text={"Cancel"}></Button>
                            <Button onClick={handleYes} text={`Yes, stop machines: ${session.machine_ids}`}></Button>
                        </div>
                    </>
                )}
                {stage === "reminder" && (
                    <>
                        <h2>Make sure you put clean water instead of larvae in machines {session.machine_ids}</h2>
                        <div className="exit-session-buttons">
                            <Button onClick={handleContinue} text={"Continue"}></Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};