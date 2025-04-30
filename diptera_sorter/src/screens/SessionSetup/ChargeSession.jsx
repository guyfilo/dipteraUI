import React, {useContext, useState, useEffect} from "react";
import subtractBack from "../SessionSetup/Subtract-back.svg";
import subtract from "../SessionSetup/Subtract.svg";
import {DataContext} from "../../communication/DataContext";
import "./style.css";
import {Checkbox} from "../../components/Checkbox/index.jsx";
import {Button} from "../../components/Button/index.js";
import {SepLine} from "../../components/SepLine/SepLine.jsx";

export const ChargeSession = ({onNext, sessionInfo}) => {
    const {liveData} = useContext(DataContext);
    const {sessions} = useContext(DataContext);
    const {
        restart_machines,
        removeMachine,
        endSession
    } = useContext(DataContext);
    const [angle, setAngle] = useState(0);
    const [messages, setMessages] = useState([]);
    const session_id = sessionInfo.session_id;
    const [selectedMachines, setSelectedMachines] = useState([]);
    const [step, setStep] = useState("charge");
    useEffect(() => {
        console.log(`machines=${sessionInfo.machine_ids} selectedMachines=${selectedMachines}`);
    }, [sessionInfo, selectedMachines]);

    useEffect(() => {
        const interval = setInterval(() => {
            setAngle(prev => prev + 1);
        }, 10);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const updateMessage = () => {
            if (!(session_id in sessions)) return;
            const session_info = sessions[session_id];
            if (!session_info?.machine_ids) return;

            const lines = [];
            let allReady = true;
            let anyError = false;

            for (const id of session_info.machine_ids) {
                const data = liveData[id];
                if (!data) {
                    lines.push(<div key={id}>Machine {id}: no data</div>);
                    allReady = false;
                    continue;
                }

                const state = data.machine_state;
                const info = data.machine_info || "";
                const error = data.error;

                lines.push(<div key={id}>
                    Machine {id} — State: {state}, Info: {info}
                </div>);

                if (!["Pause", "Running", "Killed", "Stop", "Failed"].includes(state)) {
                    allReady = false;
                }

                if (error) {
                    anyError = true;
                }
            }

            setMessages(lines);

            if (allReady) {
                if (anyError) {
                    setStep("error-summary");  // <--- set step to show error summary
                } else {
                    onNext?.();
                }
            }
        };


        const interval = setInterval(updateMessage, 200);
        return () => clearInterval(interval);
    }, [liveData, sessionInfo, onNext]);

    const charging = () => {
        return (<div className="session-setup-in">
            <div
                className="overlap-group"
                style={{
                    transform: `rotate(${angle}deg)`, transition: "transform 0.1s linear",
                }}
            >
                <img className="subtract" alt="Subtract" src={subtract}/>
                <img className="subtract" alt="Subtract" src={subtractBack}/>
            </div>

            <div className="charging-machine-messages">
                {messages.length > 0 ? messages : <div>Waiting for SERVER message...</div>}
            </div>
        </div>)
    };
    const machineSummery = (machineId) => {
        const error = liveData[machineId].error;
        return (
            <>
                <div className={"session-init-summery-machine"}>
                    <img className={"init-status"} alt={"init-status"}
                         src={error ? "/init_fail.svg" : "/init_success.svg"}></img>
                    <p className={"init-status-text"}>Machine {machineId}</p>
                    <p className={"session-init-summery-msg"}>{error ? "Could not complete" : "Completed Successfully"}</p>
                    {error ? <Checkbox className={"session-init-summery-checkbox"}
                                       text={"Run without this machine"}
                                       id={machineId}
                                       boolVar={selectedMachines.includes(machineId)}
                                       setBoolVar={(checked) => {
                                           setSelectedMachines((prev) =>
                                               checked
                                                   ? [...prev, machineId]                      // Add to list
                                                   : prev.filter((m) => m !== machineId)       // Remove from list
                                           );
                                       }}
                    ></Checkbox> : null}
                </div>
                <SepLine className={"session-init-summery-sep-line"}/>
            </>
        )
    }

    const tryAgain = async () => {
        const unselected = sessionInfo.machine_ids.filter(id => (!selectedMachines.includes(id)) && liveData[id].error);
        if (selectedMachines.length === sessionInfo.machine_ids.length) onNext();
        if (unselected) setStep("charge");
        let counter = 0;
        for (const machineId of selectedMachines) {
            await removeMachine(session_id, machineId)
            counter++;
        }
        if (counter === sessionInfo.machine_ids.length) {
            endSession(session_id);
            onNext();
        }
        await restart_machines(unselected);
    }

    const Continue = async () => {
        let counter = 0;
        for (const machineId of sessionInfo.machine_ids) {
            if (liveData[machineId].error) {
                await removeMachine(session_id, machineId);
                counter++;
            }
        }
        if (counter === sessionInfo.machine_ids.length) endSession(sessionInfo.session_id);

        onNext();
    }

    const finishCharging = () => {
        return (
            <div className="session-setup-in">
                <div className={"session-init-summery"}>
                <span className={"setupCouldNotContainer1"}>
                    <p className={"setupCouldNot"}>Setup could not finish</p>
                    <p className={"setupCouldNot"}>Please follow instructions and try again</p>
                </span>
                </div>
                <div className={"session-init-summery-machines"}>
                    {
                        sessionInfo.machine_ids.map((id) => {
                            return machineSummery(id);
                        })
                    }
                </div>
                <Button className={"session-init-retry"}
                        text={"Try Again"}
                        onClick={tryAgain}
                        once={true}
                ></Button>
                <Button className={"session-init-continue"}
                        text={"Continue"}
                        onClick={Continue}
                        once={true}
                ></Button>
            </div>)
    }


    return (
        <>
            {step === "charge" && charging()}
            {step === "error-summary" && finishCharging()}
        </>
    );
};
