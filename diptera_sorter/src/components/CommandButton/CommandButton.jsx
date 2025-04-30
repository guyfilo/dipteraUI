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
             onClick={onClick}
             onMouseDown={() => {
                 setIsPressed(true)
             }}
             onMouseUp={() => {
                 setIsPressed(false)
             }}
             onMouseLeave={() => setIsPressed(false)
        }>
            <img alt={id} className={`command-button-img`}
                 src={
                    `/btn_${id}${isPressed ? "_pressed" : ""}.svg`
                 }/>
            <div className={"tooltip"}>{text}</div>
        </div>
    )
}

