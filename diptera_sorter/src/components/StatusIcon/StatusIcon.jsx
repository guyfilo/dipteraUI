import React, {useState} from "react";
import "./style.css"

function StatusIcon({ status, error=false, width = 24, height = 24, className }) {
    const statusIcons = {
        Running: "/status_play.svg",
        Pause: "/status_pause.svg",
        error: "/status_error_stop.svg",
        Wash: "/status_wash.svg",
        Stop: "status_stop.svg",
        Calibrating: "/status_calibrate.svg",
        Connected:"/status_calibrate.svg",
        Init:"/status_init.svg",
        Sleep:"/status_sleep.svg",
    };
    const [onHover, setOnHover] = useState(false);

    return (
        <div className={className} style={{height:height,width:width, position:"relative"}}>
            <img
                className={`${["Calibrating", "Connected", "Init"].includes(status) ? "rotate" : ""}`}
                src={error ? statusIcons["error"] : statusIcons[status]}
                alt={status}
                width={width}
                height={height}
                onMouseEnter={()=>{setOnHover(true)}}
                onMouseLeave={()=>{setOnHover(false)}}
            />
            {onHover? <div className={"default-tooltip"}>{status}</div>:null
            }
        </div>

    ); // Default icon if unknown
}

export default StatusIcon;