import React, {useEffect} from 'react';
import StatusIcon from "../../components/StatusIcon/StatusIcon.jsx";
import {InputBottle} from "../../components/InputBottle/InputBottle.jsx";

import "./style.css"
export const MasterTableRow = ({data, selected, setSelected}) => {

    const getJetsonCell = ({jetId, jetState}) => {
        let is_on = jetState?.online || false;
        let is_running = jetState?.code_running|| false;
        let is_connected = jetState?.connected|| false;


        return (
            <div className={`jetson-state-cell ${selected ? "selected" : ""}`}>
                <p className={"cell-title"}>Jetson {jetId}</p>
                <div className="jetson-state-icons">
                    <img alt={""} className={"on-icon"}
                         src={`/jetson-${is_on ? 'on' : 'off'}.svg`}></img>
                    <img alt={""} className={"running-icon"}
                         src={`/jetson-${is_running ? 'running' : 'stop'}.svg`}></img>
                    <img alt={""} className={"connected-icon"}
                         src={`/jetson-${is_connected ? 'connected' : 'unconnected'}.svg`}></img>
                </div>
            </div>
        )
    }
    let jetStates = data?.jetson_states ?? {};  // fallback to empty object



    return (
        <div className={`master-row-wrapper`}>
            <div className={`master-row ${selected ? "selected" : ""}`} onClick={() => setSelected(data.machine_id)}>
                <b className={"master-row-title"}>
                    Machine {data.machine_id}
                </b>
                <div className={"master-row-status"}>
                    <p className={"cell-title"}>Status</p>
                    <StatusIcon status={data.machine_state} error={data.error}></StatusIcon>
                </div>
                <div className={"master-row-input-bottle"}>
                    <p className={"cell-title"}>Input Bottles</p>
                    <InputBottle cleanBottleFull={data.water_bottle_state}
                                 larvaeBottleFull={data.larvae_bottle_state}/>
                </div>
                <div className={"master-row-pressure"}>
                    <p className={"cell-title"}>Pressure</p>
                    {data?.pressure?.value?.toFixed(3) || "null"}
                </div>
                <div className={"master-row-sepline"}></div>
                <div className={"master-row-jetson"}>
                    {
                        ["1", "2", "3"].map(jetId =>
                            getJetsonCell({
                                jetId,
                                jetState: jetStates[`jet${jetId}`] ?? {}  // fallback to empty object
                            }))
                    }
                </div>
                <div className={"master-row-sepline"}></div>
                <div className={"master-row-operation"}>
                    operation going..
                </div>
            </div>
        </div>)
}
