import React, {useContext, useEffect, useState} from "react";
import {DataContext} from "../../communication/DataContext.jsx";
import {Button} from "../../components/Button/index.js";
import StatusIcon from "../../components/StatusIcon/StatusIcon.jsx";
import {MachineTableRow} from "../../components/MachineTableRow/MachineTableRow.jsx";
import "./style.css";
import {SelectedMachinesContext} from "../../components/SelectedMachinesContext/SelectedMachinesContext.jsx";
import {MasterTableRow} from "./masterTableRow.jsx";
import {MasterButtons} from "./masterButtons.jsx";
import {MasterTabs} from "./MasterTabs.jsx";

export const MasterPage = () => {
    const {
        liveData,
        availableMachines,
        createSession,
        fetchAvailableMachines,
        sendCommand
    } = useContext(DataContext);

    const {
        selectMachine,
        selectedMachines,
        selectSession,
        selectAll,
        removeAll,
    } = useContext(SelectedMachinesContext);
    const [selectedAvailableMachines, setSelectedAvailableMachines] = useState([]);
    const [src, setSrc] = useState("");
    const [dst, setDst] = useState("");
    const [washTime, setWashTime] = useState(5);
    const [pressure, setPressure] = useState("");
    const [selectedMachine, setSelectedMachine] = React.useState(null);

    useEffect(() => {
        console.log(selectedMachine);
    }, [selectedMachine])
    const [sizeMode, setSizeMode] = useState("hidden"); // "hidden", "small", or "full"

    const toggleSize = () => {
        if (sizeMode === "small") setSizeMode("full");
        else if (sizeMode === "full") setSizeMode("small");
        else if (sizeMode === "hidden") setSizeMode("small");
    };

    const toggleHide = () => {
        setSizeMode(prev => (prev === "hidden" ? "small" : "hidden"));
    };

    const masterSelectMachine = (machineId) => {
        removeAll();
        selectMachine(machineId);
        setSelectedMachine(machineId);
        setSizeMode("hidden");
    }


    return (
        <div className="master-screen">
            <div className={`master-table ${sizeMode}`}>
                {
                    sizeMode === "full" ?
                        <MasterTableRow data={liveData[selectedMachine]}
                                        selected={true}
                                        setSelected={masterSelectMachine}
                        ></MasterTableRow>
                        :
                    Object.entries(liveData).map(([id, machine]) => (
                    <MasterTableRow data={machine}
                                    selected={selectedMachine===id}
                                    setSelected={masterSelectMachine}
                    ></MasterTableRow>
                ))}
            </div>
            <div className={"master-button-wrapper"}>
                <MasterButtons selectedMachine={selectedMachine}></MasterButtons>
            </div>
            {selectedMachine && <div className={`master-tabs-wrapper ${sizeMode}`}>
                <MasterTabs sizeMode={sizeMode}
                            toggleSize={toggleSize}
                            toggleHide={toggleHide}
                            data={selectedMachine ? liveData[selectedMachine] :{}}
                ></MasterTabs>
            </div>}
        </div>)

};