import React, {useEffect, useState} from "react";
import {Checkbox} from "../../components/Checkbox";
import "./style.css";
import {Button} from "../../components/Button/index.js";
import {SelectTarget} from "../../components/SelectTarget/SelectTarget.jsx";

export const NewSessionForm = ({onNext, setSessionInfo, scannerMode}) => {

    const [sessionTitle, setSessionTitle] = useState("");
    const [sessionDescription, setSessionDescription] = useState("");
    const [target1Interval, setTarget1Interval] = useState("");
    const [target2Interval, setTarget2Interval] = useState("");
    const [selectedTarget1, setSelectedTarget1] = useState(null);
    const [selectedTarget2, setSelectedTarget2] = useState(null);
    const [scannerSession, setScannerSession] = useState(scannerMode);
    const [washSession, setWashSession] = useState(false);
    const [warning, setWarning] = useState("");
    const [speciesList] = useState(["Anopheles PMB1", "Anopheles gambiae", "Other"]);
    const [selectedSpecies, setSelectedSpecies] = useState("Anopheles PMB1");
    const [customSpecies, setCustomSpecies] = useState("");
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

            if (target2.every(item => target1.includes(item))) {
                setWarning("target2 cannot be contained in taget1");
            } else if (target1.every(item => target2.includes(item))) {
                setWarning("target1 cannot be contained in taget2");
            } else {
                setWarning("");
            }
        }

    }, [selectedTarget1, selectedTarget2])

    useEffect( () => {
        if (washSession) {
            setSessionTitle("Wash ");
        } else if (scannerSession) {
            if (sessionTitle === "Scanner") {
                setSessionTitle((prev)=> ``);
            }
            else if (sessionTitle && !sessionTitle.startsWith("Scanner ")) {
                setSessionTitle((prev)=> `Scanner ${prev}`);

            }
        }
    }

    )
    const getSessionId = () => {
        const now = new Date();

        const pad = (n) => n.toString().padStart(2, '0');



        return (
            `${washSession ? "WASH_" : ""}${scannerSession ? "SCAN_" : ""}SESS` +
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
        const normalSession = !scannerSession && !washSession;
        const scanner = scannerSession && !washSession;
        const washMode = washSession;

        if (normalSession && warning) return;

        const baseInfo = {
            session_id: getSessionId(),
            session_title: sessionTitle,
            session_description: sessionDescription,
            wash_mode: washMode,
            scanner_mode: scanner,
            specie: selectedSpecies === "Other" ? customSpecies : selectedSpecies,
        };

        const targetsInfo = normalSession ? {
            target1_quanta: target1Interval? parseInt(target1Interval): 0,
            target2_quanta: target2Interval? parseInt(target2Interval): 0,
            target1: selectedTarget1.split("_"),
            target2: selectedTarget2.split("_"),
        } : {
            target1_quanta: 0,
            target2_quanta: 0,
            target1: [],
            target2: [],
        };

        setSessionInfo(prev => ({
            ...prev,
            ...baseInfo,
            ...targetsInfo,
        }));

        onNext();
    };


    return (
        <div className="start-new-session">
            <div className="div">
                <div className="sessionTittle">Session Title:</div>

                <input type="text" placeholder="Type here.." className="startNewSessionChild"
                       onChange={(e) => setSessionTitle(e.target.value)}
                       value={sessionTitle}
                />
                <div className="description">Description:</div>

                <textarea placeholder="Type here.." onChange={(e) => setSessionDescription(e.target.value)}
                          className="startNewSessionItem"/>
                <div className="species-section">
                    <div className="species-label">Specie:</div>
                    <select
                        className="species-select"
                        value={selectedSpecies}
                        onChange={(e) => setSelectedSpecies(e.target.value)}
                    >
                        {speciesList.map((s, idx) => (
                            <option key={idx} value={s}>{s}</option>
                        ))}
                    </select>
                    {selectedSpecies === "Other" && (
                        <input
                            type="text"
                            className="custom-species-input"
                            placeholder="Enter custom specie..."
                            value={customSpecies}
                            onChange={(e) => setCustomSpecies(e.target.value)}
                        />
                    )}
                </div>
                {scannerSession || washSession ? null : <>
                    <div className={"sortingTarget1"}>
                        Sorting target 1:
                    </div>
                    <div className={"sortingTarget2"}>
                        Sorting target 2:
                    </div>
                    <div className={"setLimit"}>
                        <div className={"limitLarvaInterval"}>Limit larva interval:</div>
                        <input className={"setLimitChild"}
                               onChange={(e) => setTarget1Interval(e.target.value)}
                               type="number"
                               value={target1Interval}
                        />
                    </div>
                    <div className={"setLimit1"}>
                        <div className={"limitLarvaInterval"}>Limit larva interval:</div>
                        <input className={"setLimitChild"}
                               onChange={(e) => setTarget2Interval(e.target.value)}
                               type="number"
                               value={target2Interval}
                        />
                    </div>
                    <div className={"start-new-session-target2"}>
                        <div className={"select-target2"}>
                            <SelectTarget selectedTarget={selectedTarget2}
                                          setSelectedTarget={setSelectedTarget2}></SelectTarget>
                        </div>
                    </div>
                    <div className={"vertical-sep-line"}></div>
                    <div className={"start-new-session-target1"}>
                        <div className={"select-target1"}>
                            <SelectTarget selectedTarget={selectedTarget1}
                                          setSelectedTarget={setSelectedTarget1}></SelectTarget>
                        </div>
                    </div>
                    <div className={"select-target-warning"}>{warning}</div>
                </>}
                <Button className={"next-step-button button"}
                        text={"Next Step"}
                        onClick={setSession}
                        once={false}></Button>
                <div className={"template-buttons"}>
                    {!scannerSession?<div className={"template-buttons-wrapper"}>
                        <Button className={"startSetup1 button-hover"} ButtonClassName={"bwButten"}
                                text={"default sorting session"}
                                onClick={() => {
                                    setScannerSession(false);
                                    setSelectedSpecies(speciesList.at(0));
                                    setSelectedTarget1("male_fl");
                                    setSelectedTarget2("female_nfl");
                                    setTarget1Interval("1000");
                                    setTarget2Interval("1000");
                                }}>

                        </Button>

                        <Button className={"startSetup1 button-hover"} text={"wash session"}
                                ButtonClassName={washSession ? "bwButten1-pressed" : "bwButten1"}
                                onClick={() => setWashSession(!washSession)}
                        >
                        </Button>
                        {/*<Button className={"startSetup1 button-hover"} text={"scanner session"}*/}
                        {/*        ButtonClassName={scannerSession ? "bwButten2-pressed" : "bwButten2"}*/}
                        {/*        onClick={() => setScannerSession(!scannerSession)}>*/}
                        {/*</Button>*/}
                    </div>: null}
                </div>

                {/*<Button className={"addTemplateButton startSetup1"}>*/}
                {/*</Button>*/}
            </div>


        </div>
    );
};
