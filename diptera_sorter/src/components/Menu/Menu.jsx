/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import React from "react";
import "./style.css";
import {MenuOption} from "../MenuOption";

export const Menu = ({className, divClassName, selected, setSelected}) => {

    const select = setSelected;

    return (
        <div className={`menu ${className}`}>
            <div className="group">
                <div className="menu">
                    <div className="rectangle"/>
                    <MenuOption
                        text="Home"
                        style={{top: "20px"}}
                        onClick={() => (select("Home"))}
                        className={(selected === "Home" ? "menu-option-selected" : "")}
                    />
                    <MenuOption
                        text="Sessions"
                        style={{top: "70px"}}
                        onClick={() => (select("Sessions"))}
                        className={(selected === "Sessions" ? "menu-option-selected" : "")}
                    />
                    <MenuOption
                        text="Machines"
                        style={{top: "120px"}}
                        onClick={() => (select("Machines"))}
                        className={(selected === "Machines" ? "menu-option-selected" : "")}
                    />
                    <MenuOption
                        text="Treatments & Warnings"
                        style={{top: "170px"}}
                        onClick={() => (select("Treatments"))}
                        className={(selected === "Treatments" ? "menu-option-selected" : "")}
                    />
                    <MenuOption
                        text="Reports"
                        style={{top: "220px"}}
                        onClick={() => (select("Reports"))}
                        className={(selected === "Reports" ? "menu-option-selected" : "")}
                    />

                </div>
            </div>

            <div className="overlap-wrapper">
                <div className="overlap">
                    <MenuOption
                        text="Guided Help"
                        style={{top: "20px"}}
                        onClick={() => (select("Guided Help"))}
                        className={(selected === "Guided Help" ? "menu-option-selected" : "")}
                    />

                    <MenuOption
                        text="Master Mode"
                        style={{top: "70px"}}
                        onClick={() => (select("Master Mode"))}
                        className={(selected === "Master Mode" ? "menu-option-selected" : "")}
                    />
                </div>
            </div>
        </div>
    );
};

