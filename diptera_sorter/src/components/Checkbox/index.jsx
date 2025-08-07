import React, {useEffect, useState} from "react";
import "./style.css";

export const Checkbox = ({
                             id,
                             className = "",
                             rectangleClassName = "",
                             text = "",
                             boolVar,
                             setBoolVar,
                             toggle = false,
                             style = {}
                         }) => {
    const handleToggle = () => {
        setBoolVar(!boolVar);
    };

    return (
        <div className="checkbox-wrapper" style={style}>
            <div className={`checkbox-container ${className}`}>
                {boolVar ? (
                    <img
                        className={`toggle-rectangle ${rectangleClassName}`}
                        onClick={handleToggle}
                        alt="Checked"
                        src={!toggle ? "/state=checked.svg" : "/toggle_full.svg"}
                    />
                ) : (
                    !toggle ? (
                        <div
                            className={`checkbox-rectangle ${rectangleClassName}`}
                            onClick={handleToggle}
                        />
                    ) : (
                        <img
                            className={`toggle-rectangle ${rectangleClassName}`}
                            onClick={handleToggle}
                            alt="Unchecked"
                            src="/toggle_empty.svg"
                        />
                    )
                )}
                {text && <div className="checkbox-text">{text}</div>}
            </div>
        </div>
    );
};
