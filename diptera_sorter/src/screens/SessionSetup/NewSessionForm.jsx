import React, {useEffect, useState} from "react";
import {Checkbox} from "../../components/Checkbox";
import "./style.css";
import {Button} from "../../components/Button/index.js";
import {SelectTarget} from "../../components/SelectTarget/SelectTarget.jsx";

export const NewSessionForm = ({onNext, setSessionInfo}) => {

    const [sessionTitle, setSessionTitle] = useState("");
    const [sessionDescription, setSessionDescription] = useState("");
    const [target1Interval, setTarget1Interval] = useState("");
    const [target2Interval, setTarget2Interval] = useState("");
    const [selectedTarget1, setSelectedTarget1] = useState(null);
    const [selectedTarget2, setSelectedTarget2] = useState(null);
    const [warning, setWarning] = useState("");
    useEffect(() => {
        if (!selectedTarget1) {
            setWarning("you must select target1");
        } else if (!selectedTarget2) {
            setWarning("you must select target2");
        } else {
            setWarning("");
        }
        if (selectedTarget2 && selectedTarget1) {
            const target1 = selectedTarget1.split("_");
            const target2 = selectedTarget2.split("_");

            if  (target2.every(item => target1.includes(item))) {
                setWarning("target2 cannot be contained in taget1");
            } else if (target1.every(item => target2.includes(item))){
                setWarning("target1 cannot be contained in taget2");
            } else {
                setWarning("");
            }
        }

    }, [selectedTarget1, selectedTarget2])
    const getSessionId = (wash=true) => {
        const now = new Date();

        const pad = (n) => n.toString().padStart(2, '0');


        return (
            `${wash ? "WASH_" : ""}SESS` +
            pad(now.getFullYear() % 100) + // %y
            pad(now.getDate()) +          // %d
            pad(now.getMonth() + 1) +     // %m
            '_' +
            pad(now.getHours()) +         // %H
            pad(now.getMinutes()) +       // %M
            pad(now.getSeconds())         // %S
        );
    };

    const setSession = () => {
        if (warning) {
            return;
        }
        setSessionInfo(prev => ({
            ...prev,
            session_id: getSessionId(),
            session_title: sessionTitle,
            session_description: sessionDescription,
            target1_quanta: parseInt(target1Interval),
            target2_quanta: parseInt(target2Interval),
            target1: selectedTarget1.split("_"),
            target2: selectedTarget2.split("_"),
            wash_mode: false,
        }));
        onNext();
    }


    return (
        <div className="start-new-session">
            <div className="div">
                <div className="overlap">
                    <div className="session-title-input-title">Session Tittle:</div>

                    <input type="text" placeholder="Type here.." className="session-title-input"
                           onChange={(e) => setSessionTitle(e.target.value)}
                    />
                </div>
                <div className="session-description-input-title">Description:</div>

                <textarea placeholder="Type here.." onChange={(e) => setSessionDescription(e.target.value)}
                          className="session-description-input"/>
                <div className={"start-new-session-targets-wrapper"}>
                    <div className={"start-new-session-targets"}>
                        <div className={"start-new-session-target1"}>
                            <div className={"new-session-target-title"}>
                                Sorting target 1:
                            </div>
                            <div className={"new-session-target-input-title"}>
                                Limit larva interval:
                            </div>
                            <input className={"new-session-target-input"}
                                   onChange={(e) => setTarget1Interval(e.target.value)}
                                   type="number"/>
                            <div className={"select-target1"}>
                                <SelectTarget selectedTarget={selectedTarget1} setSelectedTarget={setSelectedTarget1}></SelectTarget>
                            </div>
                        </div>
                        <div className={"start-new-session-target2"}>
                            <div className={"new-session-target-title"}>
                                Sorting target 2:
                            </div>
                            <div className={"new-session-target-input-title"}>
                                Limit larva interval:
                            </div>
                            <input className={"new-session-target-input"}
                                   onChange={(e) => setTarget2Interval(e.target.value)}
                                   type="number"/>
                            <div className={"select-target2"}>
                                <SelectTarget selectedTarget={selectedTarget2} setSelectedTarget={setSelectedTarget2}></SelectTarget>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={"select-target-warning"}>{warning}</div>
                <Button className={"next-step-button"} text={"Next Step"} onClick={setSession}></Button>
                <Button
                    className={"next-step-button-wash"}
                    text={"Start Wash Session"}
                    onClick={() => {
                        setSessionInfo({
                            session_id: getSessionId(),
                            session_title: "Wash",
                            washMode: true,
                        });
                        onNext();
                    }}
                ></Button>
            </div>


        </div>
    );
};
