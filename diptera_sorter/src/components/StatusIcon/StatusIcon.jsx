import React from "react";
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
        Init:"/status_calibrate.svg",
        Sleep:"/status_sleep.svg",
    };

    return (
        <img
            className={`${className || ""} ${["Calibrating", "Connected", "Init"].includes(status) ? "rotate" : ""}`}
            src={error ? statusIcons["error"] : statusIcons[status]}
            alt={status}
            width={width}
            height={height}
        />
    ); // Default icon if unknown
}

export default StatusIcon;