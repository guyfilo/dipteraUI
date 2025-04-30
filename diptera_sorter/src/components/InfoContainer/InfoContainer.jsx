import React from "react";
import "./style.css"

export const InfoContainer = ({title, titleClassName, info, className, children}) => {
    return <div className={`info-container ${className}`}>
        <div className="info-container-title">{title}</div>
        <img className="info-icon" src="/infoIcon.svg" alt="InfoIcon"></img>
        <div className="info-tooltip">{info}</div>
        <div className="info-children">{children}</div>

    </div>
}