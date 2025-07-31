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
import "./style.css"
import {Button} from "../Button/index.js";

export const SessionInfoTable = ({className, session_data, machines_data}) => {
    const {
        endSession,
        sendCommand,
        restart_machines,
        removeMachine
    } = useContext(DataContext);

    const getTableRow = ({machine_id, machineData,}) => {
        return (
            <>
                <tr className={"table-row"}>
                    <td className="table-data col-machine-name"><MachineTableRow machineId={machine_id}/></td>

                    <td className="table-data col-status">
                        <p>Status: </p>
                        <div className="td-widget" style={{top: "3px"}}>
                            <StatusIcon status={machineData.machine_state} error={machineData.error}/>
                        </div>
                    </td>

                    <td className="table-data col-input-bottle">
                        <p>Input Bottle: </p>
                        <div className="td-widget">
                            <InputBottle cleanBottleFull={machineData.water_bottle_state }
                                         larvaeBottleFull={machineData.larvae_bottle_state }/>
                        </div>
                    </td>

                    <td className="table-data col-output-bottle">
                        <p>Output Bottle:</p>
                        <div className="td-widget">
                            <OutputBottles
                                target1={session_data.target1}
                                target2={session_data.target2}
                                collectTarget1={machineData.collect_target1}
                                collectTarget2={machineData.collect_target2}
                                machineData={machineData}
                            />
                        </div>
                    </td>
                    <td className="table-data col-output-bottle">
                        <div  className="td-widget">
                            <RunningStatistics stats={machineData} />
                        </div>
                    </td>
                </tr>
                <tr >
                    <td colSpan={6}>
                        <SepLine className="line-under-row-table"/>
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

                    <td className="table-data col-status">
                        <p>Status: </p>
                        <div className="td-widget">
                            <StatusIcon status={machineData.machine_state} error={machineData.error}/>
                        </div>
                    </td>
                    <td className="table-data " colSpan={4}>
                        <div className={"error-handle"}>
                            <div className="theMachineHas">The machine has stopped due to an error.</div>
                            <Button className={"handle-error-button"} text={"restart"}
                                    onClick={async () => {
                                        await restart_machines([machine_id]);
                                    }} once={true}>
                            </Button>
                            <Button  className={"handle-error-button"} text={"remove"}
                                     onClick={async () => {
                                         await removeMachine(machineData.session_id, machine_id);
                                     }} once={true}>
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

    return <div className="session-info-table-container">
        <Checkbox className="choose-all-checkbox"
                  text={"Choose All Machines"}
                  textClassName="choose-all-text"
                  rectangleClassName="choose-all-rectangle"
        />
        <div className="scroll-table">
            <table className={`session-info-table`}>
                <tbody>
                {
                    Object.entries(machines_data).map(([key, value]) => (
                        value.error ? handleError({machine_id: key, machineData: value}) :
                            getTableRow({machine_id: key, machineData: value})
                    ))
                }
                </tbody>
            </table>
        </div>
    </div>
}