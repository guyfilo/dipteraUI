import React, {useContext} from "react";
import "./style.css";
import {useState, useEffect} from "react";
import {ChargeSession} from "./ChargeSession.jsx";
import {FinishSessionInit} from "./FinishSessionInit.jsx";
import {NewSessionForm} from "./NewSessionForm.jsx";
import {DataContext, DataProvider} from "../../communication/DataContext.jsx";
import {ChooseMachines} from "./ChooseMachines.jsx";

export const StartSession = ({closeWindowCbk, washMode = false, scannerMode= false}) => {
    const {
        liveData,
        availableMachines,
        createSession,
        endSession,
        sendCommand,
        fetchAvailableMachines,
        sessions,
    } = useContext(DataContext);
    const [sessionInfo, setSessionInfo] = useState({});
    const [step, setStep] = useState("new");

    // handlers to pass down to children
    const goToNextStep = () => {
        if (step === "new") setStep("choose");
        else if (step === "choose") setStep("charge");
        else if (step === "charge") setStep("finish");
    };

    const goToPrevStep = () => {
        if (step === "choose") setStep("new");
        else if (step === "charge") setStep("choose");
        else if (step === "finish") setStep("charge");
    };


    let content;
    if (step === "new") {
        content = <NewSessionForm setSessionInfo={setSessionInfo} onNext={goToNextStep} scannerMode={scannerMode}/>;
    } else if (step === "choose") {
        content = <ChooseMachines setSessionInfo={setSessionInfo} onNext={goToNextStep} sessionInfo={sessionInfo}/>;
    } else if (step === "charge") {
        content = <ChargeSession sessionInfo={sessionInfo} onNext={goToNextStep}/>;
    } else if (step === "finish") {
        content = <FinishSessionInit startSession={async () => sendCommand(
            "run",
            [],
            [sessionInfo.session_id]
        )}/>;
    }
    // <div className={styles.pageChange}>
    //     <div className={styles.pageChangeChild} />
    //     <div className={styles.pageChangeItem} />
    //     <div className={styles.pageChangeInner} />
    //     <div className={styles.ellipseDiv} />
    // </div>
    return (
        <div className="start-session-window">
            <div className="div">
                {content}
                <div className="pageChange">


                    <div className={`ellipseDiv ${step === "new" ? "dark_ellipse" : "bright_ellipse"}`}
                    />

                    <div className={`pageChangeChild ${step === "choose" ? "dark_ellipse" : "bright_ellipse"}`}
                    />
                    <div className={`pageChangeItem ${step === "charge" ? "dark_ellipse" : "bright_ellipse"}`}
                    />

                    <div className={`pageChangeInner ${step === "finish" ? "dark_ellipse" : "bright_ellipse"}`}
                    />
                </div>
            </div>

        </div>
    );

};
