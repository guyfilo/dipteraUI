import React, { useEffect, useState } from "react";
import "./style.css";
import vector8 from "./state=checked.svg";

export const Checkbox = ({
                             id,
                             className = "",
                             rectangleClassName = "",
                             text = "",
                             boolVar,
                             setBoolVar
                         }) => {
    const handleToggle = () => {
        if (typeof setBoolVar === "function") {
            setBoolVar(setBoolVar.length === 0 ? undefined : !boolVar);
        }
    };

    return (
        <div className={`checkbox-container ${className}`}>
            {boolVar ? (
                <img
                    className={`checkbox-rectangle ${rectangleClassName}`}
                    onClick={handleToggle}
                    alt="Checked"
                    src={vector8}
                />
            ) : (
                <div
                    className={`checkbox-rectangle ${rectangleClassName}`}
                    onClick={handleToggle}
                />
            )}
            {text && <div className="checkbox-text">{text}</div>}
        </div>
    );
};
