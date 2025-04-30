import React, { useState } from "react";
import "./style.css";

export const Button = ({
                           className = "",
                           divClassName = "",
                           text = "Start setup",
                           onClick,
                           once = false, // <-- NEW: if true, button disables itself after click
                       }) => {
    const [isPressed, setIsPressed] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false);

    const handleClick = async (e) => {
        if (isDisabled) return; // Prevent clicks if already disabled

        if (once) {
            setIsDisabled(true); // Disable immediately if once=true
        }

        if (onClick) {
            await onClick(e); // Support async functions too
        }
    };

    return (
        <div
            className={`button ${className} ${isPressed ? "button-pressed" : ""} ${isDisabled ? "button-disabled" : ""}`}
            onMouseDown={() => !isDisabled && setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onMouseLeave={() => setIsPressed(false)}
            onClick={handleClick}
            style={{ pointerEvents: isDisabled ? "none" : "auto", opacity: isDisabled ? 0.6 : 1 }}
        >
            <div className={`button-text ${divClassName}`}>{text}</div>
        </div>
    );
};