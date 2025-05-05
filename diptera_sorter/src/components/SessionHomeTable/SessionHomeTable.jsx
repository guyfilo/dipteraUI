import React, { useContext, useState } from "react";
import "./style.css";
import { Checkbox } from "../Checkbox/index.jsx";
import { SepLine } from "../SepLine/SepLine.jsx";
import StatusIcon from "../StatusIcon/StatusIcon.jsx";
import { InputBottle } from "../InputBottle/InputBottle.jsx";
import { OutputBottles } from "../OutputBottle/OutputBottle.jsx";
import { RunningStatistics } from "../RunningStats/RunningStats.jsx";
import { MachineTableRow } from "../MachineTableRow/MachineTableRow.jsx";
import { DataContext } from "../../communication/DataContext.jsx";
import { SelectedMachinesContext } from "../SelectedMachinesContext/SelectedMachinesContext.jsx";
import { EndSession } from "../EndSession/EndSession.jsx";
import { Button } from "../Button/index.js";
import HandleStop from "../HandleStop/HandleStop.jsx";

export const SessionHomeTable = ({ session_data, machines_data }) => {
    const {
        endSession,
        sendCommand,
        restart_machines,
        removeMachine
    } = useContext(DataContext);

    const {
        selectSession,
        selectedSessions,
        stopRequest,
        setStopRequest,
        stopSessionRequest,
        setStopSessionRequest
    } = useContext(SelectedMachinesContext);

    const [exitButtonState, setExitButtonState] = useState("default");
    let showExit = stopSessionRequest.includes(session_data.session_id);
    const isSelected = selectedSessions.includes(session_data.session_id);

    const machinesInSession = Object.fromEntries(
        Object.entries(machines_data).filter(([id]) => session_data.machine_ids.includes(id))
    );

    const handleExitClick = () => {
        setStopSessionRequest(prev =>
            prev.includes(session_data.session_id) ? prev : [...prev, session_data.session_id]
        );
    };

    const toggleSelected = () => {
        selectSession(session_data.session_id, !isSelected);
    };

    const finishSession = () => {
        endSession(session_data.session_id);
    };

    const onReady = () => {
        sendCommand("wash_end_session", session_data.machine_ids, [session_data.session_id]);
        setStopSessionRequest(prev => prev.filter(id => id !== session_data.session_id));
    };

    const renderMachineRow = (machine_id, machineData) => {
        const commonProps = {
            machine_id,
            machineData
        };

        if (machineData.error) {
            return (
                <React.Fragment key={machine_id}>
                    <tr className="table-row">
                        <td className="table-data col-machine-name"><MachineTableRow machineId={machine_id} /></td>
                        <td className="table-data col-status"><StatusIcon status={machineData.machine_state} error={machineData.error} /></td>
                        <td className="table-data" colSpan={4}>
                            <div className="error-handle">
                                <div className="theMachineHas">The machine has stopped due to an error.</div>
                                <Button className="handle-error-button" text="restart" onClick={async () => await restart_machines([machine_id])} />
                                <Button className="handle-error-button" text="remove" onClick={async () => await removeMachine(machineData.session_id, machine_id)} />
                            </div>
                        </td>
                    </tr>
                    <tr><td colSpan={6}><SepLine className="line-under-row" /></td></tr>
                </React.Fragment>
            );
        }

        if (stopRequest.includes(machine_id)) {
            return (
                <React.Fragment key={machine_id}>
                    <tr className="table-row">
                        <td className="table-data col-machine-name"><MachineTableRow machineId={machine_id} /></td>
                        <td className="table-data col-status"><StatusIcon status={machineData.machine_state} /></td>
                        <td className="table-data col-stop" colSpan={4}>
                            <HandleStop setStopRequest={setStopRequest} machine_id={machine_id} />
                        </td>
                    </tr>
                    <tr><td colSpan={6}><SepLine className="line-under-row" /></td></tr>
                </React.Fragment>
            );
        }

        return (
            <React.Fragment key={machine_id}>
                <tr className="table-row">
                    <td className="table-data col-machine-name"><MachineTableRow machineId={machine_id} /></td>
                    <td className="table-data col-status"><StatusIcon status={machineData.machine_state} error={machineData.error} /></td>
                    <td className="table-data col-input-bottle">
                        <InputBottle
                            cleanBottleFull={machineData.water_bottle_state === "Full"}
                            larvaeBottleFull={machineData.larvae_bottle_state === "Full"}
                        />
                    </td>
                    <td className="table-data col-output-bottle">
                        <OutputBottles
                            target1={session_data.target1}
                            target2={session_data.target2}
                            collectTarget1={machineData.collect_target1}
                            collectTarget2={machineData.collect_target2}
                        />
                    </td>
                    <td colSpan={2} className="table-data col-running-stats">
                        <RunningStatistics stats={machineData} />
                    </td>
                </tr>
                <tr><td colSpan={6}><SepLine className="line-under-row" /></td></tr>
            </React.Fragment>
        );
    };

    const exitBtnSrc = {
        default: "/exit_button.svg",
        hover: "/exit_button_hover.svg",
        pressed: "/exit_button_hover.svg"
    }[exitButtonState];

    return (
        <div className="machine-list-in">
            <div className="session-table-container">
                <img
                    className={exitButtonState === "default" ? "exit-session-button" : "exit-session-button-hover"}
                    alt="exit"
                    src={exitBtnSrc}
                    onMouseEnter={() => setExitButtonState("hover")}
                    onMouseLeave={() => setExitButtonState("default")}
                    onMouseDown={() => setExitButtonState("pressed")}
                    onMouseUp={() => setExitButtonState("hover")}
                    onClick={handleExitClick}
                />

                <div className="session-title-wrapper">
                    <Checkbox
                        className="select-all-checkbox"
                        id="select-all-checkbox"
                        rectangleClassName="rectangle-checkbox-target"
                        boolVar={isSelected}
                        setBoolVar={toggleSelected}
                    />
                    <div className="session-title">{session_data.session_title}</div>
                    <SepLine className="line-under-title" />
                </div>

                {showExit && (
                    <EndSession
                        onFinishSession={finishSession}
                        session={session_data}
                        onReady={onReady}
                    />
                )}

                <table className="table-session-short">
                    <thead>
                    <tr>
                        {[
                            { key: "#", label: "", width: "175px" },
                            { key: "status", label: "Status", width: "70px" },
                            { key: "inBottle", label: "Input Bottle", width: "150px" },
                            { key: "outBottle", label: "Output Bottle", width: "200px" },
                            { key: "stats", label: "Running Stats", width: "200px" },
                        ].map(({ key, label, width }) => (
                            <th key={key} className="headers" style={{ width }}>{label}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {Object.entries(machinesInSession).map(([id, data]) => renderMachineRow(id, data))}
                    <tr>
                        <td colSpan={6}>
                            <div className="add-machine">+ Add another machine to this session</div>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};
