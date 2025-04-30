import React, {useContext, useState} from "react";
import "./style.css";
import {Checkbox} from "../Checkbox/index.jsx";
import {SepLine} from "../SepLine/SepLine.jsx";
import StatusIcon from "../StatusIcon/StatusIcon.jsx";
import {InputBottle} from "../InputBottle/InputBottle.jsx";
import {OutputBottle, OutputBottles} from "../OutputBottle/OutputBottle.jsx";
import WarningIcon from "../WarningsIcon/WarningIcon.jsx";
import {RunningStatistics} from "../RunningStats/RunningStats.jsx";
import {MachineTableRow} from "../MachineTableRow/MachineTableRow.jsx";
import {DataContext} from "../../communication/DataContext.jsx";
import {SelectedMachinesContext} from "../SelectedMachinesContext/SelectedMachinesContext.jsx";
import {EndSession} from "../EndSession/EndSession.jsx";
import {Button} from "../Button/index.js";


export const SessionHomeTable = ({session_data, machines_data}) => {
    const tableColumns = {
        "#": {"header": "", "width": "175px"},
        status: {"header": "Status", "width": "70px"},
        inBottle: {"header": "Input Bottle", "width": "150px"},
        outBottle: {"header": "Output Bottle", "width": "200px"},
        // warnings: {"header": "Warnings", "width": "100px"},
        stats: {"header": "Running Stats", "width": "200px"},
    };
    const {
        endSession,
        sendCommand,
        restart_machines,
        removeMachine
    } = useContext(DataContext);
    const data = Object.fromEntries(
        Object.entries(machines_data).filter(
            ([machineId]) => session_data.machine_ids.includes(machineId)
        )
    );
    const {selectSession, selectedSessions} = useContext(SelectedMachinesContext);
    const isSelected = selectedSessions.includes(session_data.session_id);

    const toggleSelected = () => {
        selectSession(session_data.session_id, !isSelected);
    };
    const [exitButtonState, setExitButtonState] = useState("default"); // "default", "hover", or "pressed"
    let src = "/exit_button.svg";
    if (exitButtonState === "hover") src = "/exit_button_hover.svg";
    else if (exitButtonState === "pressed") src = "/exit_button_pressed.svg";
    const [showExit, setShowExit] = useState(false);
    const finishSession = () => {
        endSession(session_data.session_id)
    }
    const onReady = () => {
        sendCommand("wash_end_session", session_data.machine_ids, [session_data.session_id]);
        setShowExit(false);
    }

    const getTableRow = ({machine_id, machineData,}) => {
        return (
            <>
                <tr className={"table-row"}>
                    <td className="table-data col-machine-name"><MachineTableRow machineId={machine_id}/></td>
                    <td className="table-data col-status"><StatusIcon status={machineData.machine_state}
                                                                      error={machineData.error}/>
                    </td>
                    <td className="table-data col-input-bottle"><InputBottle
                        cleanBottleFull={machineData.water_bottle_state === "Full"}
                        larvaeBottleFull={machineData.larvae_bottle_state === "Full"}/></td>
                    <td className="table-data col-output-bottle">
                        <OutputBottles
                        target1={session_data.target1}
                        target2={session_data.target2}
                        collectTarget1={machineData.collect_target1}
                        collectTarget2={machineData.collect_target2}/>
                    </td>
                    {/*<td className="table-data col-warnings"><WarningIcon isError={value.error_occurred}*/}
                    {/*                                                     warnings={value.warnings}/>*/}
                    {/*</td>*/}
                    <td colSpan={2} className="table-data col-running-stats">
                        <RunningStatistics stats={machineData}/>
                    </td>
                </tr>
                <tr>
                    <td colSpan={6}>
                        <SepLine className="line-under-row"/>
                    </td>
                </tr>
            </>
        )
    }


    function handleError({machine_id, machineData}) {
        return (
            <>
                <tr className={"table-row"}>
                    <td className="table-data col-machine-name"><MachineTableRow machineId={machine_id}/></td>
                    <td className="table-data col-status"><StatusIcon status={machineData.machine_state}
                                                                      error={machineData.error}/>
                    </td>
                    <td className="table-data " colSpan={4}>
                        <div className={"error-handle"}>
                            <div className="theMachineHas">The machine has stopped due to an error.</div>
                            <Button className={"handle-error-button"} text={"restart"}
                                    onClick={async () => {
                                        await restart_machines([machine_id]);
                                    }}>
                            </Button>
                            <Button  className={"handle-error-button"} text={"remove"}
                                     onClick={async () => {
                                         await removeMachine(machineData.session_id, machine_id);
                                     }}>
                            </Button>
                        </div>

                    </td>
                </tr>
                <tr>
                    <td colSpan={6}>
                        <SepLine className="line-under-row"/>
                    </td>
                </tr>
            </>
        )
    }

    return (
        <div className="machine-list-in">
            <div className="session-table-container">
                <img
                    className="exit-session-button"
                    alt="exit"
                    src={src}
                    onMouseEnter={() => setExitButtonState("hover")}
                    onMouseLeave={() => setExitButtonState("default")}
                    onMouseDown={() => setExitButtonState("pressed")}
                    onMouseUp={() => setExitButtonState("hover")}
                    onClick={() => setShowExit(true)}
                />

                <div className="session-title-wrapper">
                    <Checkbox className="select-all-checkbox"
                              id="select-all-checkbox"
                              rectangleClassName="rectangle-checkbox-target"
                              boolVar={isSelected}
                              setBoolVar={toggleSelected}
                    ></Checkbox>
                    <div className="session-title">{`${session_data.session_title}`}</div>
                    <SepLine className="line-under-title"></SepLine>
                </div>
                {showExit && (
                    <EndSession
                        onFinishSession={finishSession}
                        onCancel={() => setShowExit(false)}
                        onReady={onReady}
                        session={session_data}
                    />
                )}
                <table className="table-session-short">
                    <thead>
                    <tr>
                        {Object.keys(tableColumns).map((key) => {
                            return (
                                <th className={"headers"} key={key}
                                    style={{width: tableColumns[key]["width"]}}>{tableColumns[key]["header"]}</th>
                            )
                        })}
                    </tr>
                    </thead>
                    <tbody>
                    {
                        Object.entries(data).map(([key, value]) => (
                            value.error ? handleError({machine_id: key, machineData: value}) :
                                getTableRow({machine_id: key, machineData: value})
                        ))
                    }
                    <tr>
                        <td colSpan={6}>
                            <div className="add-machine">+ Add another machine to this session</div>
                        </td>
                    </tr>
                    </tbody>
                </table>

            </div>
        </div>
    )

};
