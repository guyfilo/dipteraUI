import React from "react";
import {useState} from "react";
import "./style.css";

export const CommandButton = ({
                                  id,
                                  text,
                                  className,
                                  onClick,
                              }) => {
    const [isPressed, setIsPressed] = useState(false);

    return (
        <div className={`command-button ${className}`}

        >
            <img alt={id} className={`command-button-img`}
                 src={
                    `/btn_${id}${isPressed ? "_pressed" : ""}.svg`
                 }
                 onClick={onClick}
                 onMouseDown={() => {
                     setIsPressed(true)
                 }}
                 onMouseUp={() => {
                     setIsPressed(false)
                 }}
                 onMouseLeave={() => setIsPressed(false)}
            />
            <div className={"tooltip"}>{text}</div>
        </div>
    )
}

