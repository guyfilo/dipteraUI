import React from "react";


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
    };

    return (
        <img
            className={className}
            src={error? statusIcons["error"]: statusIcons[status]}
            alt={status}
            width={width}
            height={height}
        />
    ); // Default icon if unknown
}

export default StatusIcon;