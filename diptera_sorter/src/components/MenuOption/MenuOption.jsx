import React, {useState} from "react";
import "./style.css";

export const MenuOption = ({className, divClassName, text, onClick, top, style}) => {
    const [isPressed, setIsPressed] = useState(false);

    return (
        <div
            className={`menu-option ${className} ${isPressed ? "menu-option-pressed" : ""}`}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onMouseLeave={() => setIsPressed(false)}
            onClick={onClick}  // Callback function triggered when clicked
            style={style} // Apply dynamic style
        >
            {text}
        </div>
    );
};