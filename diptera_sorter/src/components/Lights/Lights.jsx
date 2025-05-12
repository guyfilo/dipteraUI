import React, {useState} from 'react';
import "./style.css";

const Light = ({color, tooltip, className, stateGetter})=>{
    const [onHover, setOnHover] = useState(false);
    return (
        <div className={className}>
            <img alt={"red"} src={stateGetter() ? `${color}-on.svg` : `${color}-off.svg`}
                 onMouseEnter={()=>{setOnHover(true)}}
                 onMouseLeave={()=>{setOnHover(false)}}
            />
            {onHover? <div className={"default-tooltip"}>{tooltip}</div>:null
            }
        </div>
    );
}
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

                <Light className={"red-light"} color={"red"} stateGetter={error} tooltip={"Machine Stoped"}/>
                <Light className={"blue-light"} color={"blue"} stateGetter={bottleMsg} tooltip={"Container Action"}/>
                <Light className={"green-light"} color={"green"} stateGetter={isRunning} tooltip={"Machine Running"}/>

            </div>
        </div>
    )
}