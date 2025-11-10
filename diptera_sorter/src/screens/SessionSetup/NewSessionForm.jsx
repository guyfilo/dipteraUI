import React, {useEffect, useState} from "react";
import {Checkbox} from "../../components/Checkbox";
import "./style.css";
import {Button} from "../../components/Button/index.js";
import {SelectTarget} from "../../components/SelectTarget/SelectTarget.jsx";

const SPECIES_KEY = 'saved_species';
const DEFAULT_SPECIES = [
    { name: "ANO_YDF", color: "#e3bac2" },
    { name: "ANO_WT", color: "#d6734e" },
    { name: "ANO_PMB1_FC", color: "#ffbd66" },
    { name: "ANO_PMB1_MC", color: "#ffb066" },
    { name: "ALB_DSRED", color: "#00d003" },
    { name: "ALB_WT", color: "#217e21" },
];
const SpeciesDropdown = ({speciesList, setSpeciesList, selectedSpecies, setSelectedSpecies}) => {
    const [open, setOpen] = useState(false);
    const [addingNew, setAddingNew] = useState(false);
    const [newName, setNewName] = useState("");
    const [newColor, setNewColor] = useState("#000000");

    const saveNewSpecies = () => {
        const newSpecies = {name: newName.trim(), color: newColor};
        const updatedList = [...speciesList, newSpecies];
        setSpeciesList(updatedList);
        setSelectedSpecies(newSpecies);
        localStorage.setItem("saved_species", JSON.stringify(updatedList));
        setAddingNew(false);
        setNewName("");
        setNewColor("#000000");
        setOpen(false);
    };

    return (<div className="custom-dropdown">
        <div
            className="custom-dropdown-header"
            onClick={() => setOpen(!open)}
            style={{borderColor: selectedSpecies?.color || '#ccc'}}
        >
            <span className="color-box" style={{backgroundColor: selectedSpecies?.color}}/>
            {selectedSpecies?.name || "Select specie..."}
        </div>
        {open && (<div className="custom-dropdown-list">
            {!addingNew ? (<>
                {speciesList.map((s, idx) => (<div
                    key={idx}
                    className="custom-dropdown-item"
                    onClick={() => {
                        setSelectedSpecies(s);
                        setOpen(false);
                    }}
                >
                    <span className="color-box" style={{backgroundColor: s.color}}/>
                    {s.name}
                </div>))}
                <div className="custom-dropdown-item add-new" onClick={() => setAddingNew(true)}>
                    + Add new
                </div>
            </>) : (<div className="custom-dropdown-add">
                <input
                    type="text"
                    placeholder="New species name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                />
                <input
                    type="color"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                />
                <div className="custom-dropdown-add-actions">
                    <button onClick={saveNewSpecies}>Save</button>
                    <button onClick={() => setAddingNew(false)}>Cancel</button>
                </div>
            </div>)}
        </div>)}
    </div>);
};


export const NewSessionForm = ({onNext, setSessionInfo, scannerMode}) => {
    const [sessionTitle, setSessionTitle] = useState("");
    const [sessionDescription, setSessionDescription] = useState("");
    const [target1Interval, setTarget1Interval] = useState("");
    const [target2Interval, setTarget2Interval] = useState("");
    const [selectedTarget1, setSelectedTarget1] = useState(null);
    const [selectedTarget2, setSelectedTarget2] = useState(null);
    const [scannerSession, setScannerSession] = useState(scannerMode);
    const [washSession, setWashSession] = useState(false);
    const [sizerSession, setSizerSession] = useState(false);
    const [warning, setWarning] = useState("");
    const [speciesList, setSpeciesList] = useState([]);
    const [selectedSpecies, setSelectedSpecies] = useState(null);
    const [customSpecies, setCustomSpecies] = useState("");
    const [age, setAge] = useState("");
    const [bloodFeed, setBloodFeed] = useState("");
    const [stage, setStage] = useState("");

    useEffect(() => {
        const storedSpecies = JSON.parse(localStorage.getItem(SPECIES_KEY)) || [];
        // merge local + defaults, keeping unique names
        const merged = [
            ...DEFAULT_SPECIES
        ];
        setSpeciesList(merged);
        setSelectedSpecies(merged[0]);
        localStorage.setItem(SPECIES_KEY, JSON.stringify(merged));
    }, []);

    useEffect(() => {
        if (!selectedTarget1) {
            setWarning("you must select target1");
        } else if (!selectedTarget2) {
            setWarning("you must select target2");
        } else {
            setWarning("");
        }
        // if (selectedTarget2 && selectedTarget1) {
        //     const target1 = selectedTarget1.split("_");
        //     const target2 = selectedTarget2.split("_");
        //     if (target2.every(item => target1.includes(item))) {
        //         setWarning("target2 cannot be contained in taget1");
        //     } else if (target1.every(item => target2.includes(item))) {
        //         setWarning("target1 cannot be contained in taget2");
        //     } else {
        //         setWarning("");
        //     }
        // }
    }, [selectedTarget1, selectedTarget2]);

    useEffect(() => {
        if (washSession) {
            setSessionTitle("Wash");
        } else if (scannerSession) {
            if (sessionTitle === "Scanner") setSessionTitle(""); else if (sessionTitle && !sessionTitle.startsWith("Scanner ")) {
                setSessionTitle(prev => `Scanner ${prev}`);
            }
        } else if (sizerSession) {
            if (sessionTitle === "Sizer") setSessionTitle(""); else if (sessionTitle && !sessionTitle.startsWith("Sizer ")) {
                setSessionTitle(prev => `Sizer ${prev}`);
            }
        }
    });

    const getSessionId = () => {
        const now = new Date();
        const pad = (n) => n.toString().padStart(2, '0');
        return `${washSession ? "WASH_" : ""}${scannerSession ? "SCAN_" : ""}${sizerSession ? "SIZER" : ""}SESS` + pad(now.getFullYear() % 100) + pad(now.getMonth() + 1) + pad(now.getDate()) + '_' + pad(now.getHours()) + pad(now.getMinutes()) + pad(now.getSeconds());
    };

    const autoDescription = `Line: ${selectedSpecies?.name}, Age: ${age}, Blood Feed: ${bloodFeed}, Stage: ${stage}\n`;

    const setSession = () => {
        const normalSession = !scannerSession && !washSession && !sizerSession;
        const scanner = scannerSession && !washSession;
        const washMode = washSession;
        if (normalSession && warning) return;
        const baseInfo = {
            session_id: getSessionId(),
            session_title: sessionTitle,
            session_description: sessionDescription || autoDescription,
            wash_mode: washMode,
            scanner_mode: scanner,
            sizer_mode: sizerSession,
            specie: selectedSpecies?.name,
            age: age ? parseInt(age) : null,
            blood_feed: bloodFeed,
            stage: stage,
        };
        const targetsInfo = normalSession ? {
            target1_quanta: target1Interval ? parseInt(target1Interval) : 0,
            target2_quanta: target2Interval ? parseInt(target2Interval) : 0,
            target1: selectedTarget1.split("_"),
            target2: selectedTarget2.split("_"),
        } : sizerSession ? {
            target1_quanta: 0,
            target2_quanta: 0,
            target1: ["male", "fl"],
            target2: ["female", "nfl"],
            } :
            {
            target1_quanta: 0, target2_quanta: 0, target1: [], target2: [],
        };
        setSessionInfo(prev => ({...prev, ...baseInfo, ...targetsInfo}));
        onNext();
    };

    return (<div className="start-new-session">
        <div className="div">
            <div className="sessionTittle">Session Title:</div>
            <input type="text" placeholder="Type here.." className="startNewSessionChild"
                   onChange={(e) => setSessionTitle(e.target.value)}
                   value={sessionTitle}/>
            <div className="description">Description:</div>
            <textarea placeholder="Type here.." onChange={(e) => setSessionDescription(e.target.value)}
                      className="startNewSessionItem" value={sessionDescription || autoDescription}/>

            <div className="species-section">
                <div className="species-label">Line/Specie:</div>
                <SpeciesDropdown
                    speciesList={speciesList}
                    setSpeciesList={setSpeciesList}
                    selectedSpecies={selectedSpecies}
                    setSelectedSpecies={setSelectedSpecies}
                />

            </div>

            <div className="additional-info">
                <div className="form-field">
                    <label>Age:</label>
                    <input type="number" value={age} onChange={(e) => setAge(e.target.value)}/>
                </div>
                <div className="form-field">
                    <label>Blood Feed:</label>
                    <input type="text" value={bloodFeed} onChange={(e) => setBloodFeed(e.target.value)}/>
                </div>
                <div className="form-field">
                    <label>Stage:</label>
                    <select value={stage} onChange={(e) => setStage(e.target.value)}>
                        <option value="L4">L4</option>
                        <option value="PUPA">PUPA</option>
                        <option value="L3">L3</option>
                        <option value="L2">L2</option>
                    </select>
                </div>
            </div>

            <Button className={"next-step-button button"} text={"Next Step"} onClick={setSession} once={false}/>
            {scannerSession || washSession || sizerSession ? null : <>
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
                {!scannerSession ? <div className={"template-buttons-wrapper"}>
                    <Button className={"startSetup1"} ButtonClassName={"bwButten"}
                            text={"default sorting session"}
                            onClick={() => {
                                setScannerSession(false);
                                setWashSession(false);
                                setSizerSession(false);
                                setSelectedSpecies(speciesList.at(0));
                                setSelectedTarget1("male_fl");
                                setSelectedTarget2("female_nfl");
                                setTarget1Interval("1000");
                                setTarget2Interval("1000");
                            }}>

                    </Button>

                    <Button className={"startSetup1"} text={"wash session"}
                            ButtonClassName={washSession ? "bwButten1-pressed" : "bwButten1"}
                            onClick={() => {
                                setWashSession(!washSession);
                                setSizerSession(false);
                            }}
                    >
                    </Button>
                    <Button className={"startSetup1"} text={"sizer session"}
                            ButtonClassName={sizerSession ? "bwButten2-pressed" : "bwButten2"}
                            onClick={() => {
                                setSizerSession(!sizerSession);
                                setWashSession(false);
                            }}>
                    </Button>
                </div> : null}
            </div>

            {/*<Button className={"addTemplateButton startSetup1"}>*/}
            {/*</Button>*/}
        </div>


    </div>);
};
