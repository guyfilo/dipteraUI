import React, {useState} from 'react';
import "./style.css";
export const Lights = ({sessions, liveData}) => {


    const isRunning = () => (
        Object.values(liveData).some(machine => machine.machine_state === "Running")
    )

    const bottleMsg = () => (
        Object.values(liveData).some(machine => (
            machine?.collect_target1 ||
            machine?.collect_target2 ||
            machine?.water_bottle_state === "Empty" ||
            machine?.larvae_bottle_state === "Empty"
        ))
    );

    const error = () => (
        Object.values(liveData).some(machine => (machine?.error))
    )




    return (
        <div className={"lights-container"}>
            <div className={"lights-overlap"}>
                <img className={"red-light"} alt={"red"} src={error() ?"red-on.svg" : "red-off.svg"}/>
                <img className={"blue-light"} alt={"red"} src={bottleMsg() ? "blue-on.svg": "blue-off.svg"}/>
                <img className={"green-light"} alt={"red"} src={isRunning() ?"green-on.svg": "green-off.svg"}/>
            </div>
        </div>
    )
}