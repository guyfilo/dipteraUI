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
                    <div className={"header-menu-option"} style={{top: "59px"}}>
                        Dashboards
                    </div>

                    <MenuOption
                        text="Sessions"
                        style={{top: "89px", left: "49px"}}
                        onClick={() => (select("Sessions"))}
                        className={(selected === "Sessions" ? "menu-option-selected" : "")}
                    />
                    <MenuOption
                        text="Machines"
                        style={{top: "119px", left: "49px"}}
                        onClick={() => (select("Machines"))}
                        className={(selected === "Machines" ? "menu-option-selected" : "")}
                    />
                    <MenuOption
                        text="Scanner"
                        style={{top: "159px"}}
                        onClick={() => (select("Scanner"))}
                        className={(selected === "Scanner" ? "menu-option-selected" : "")}
                    />
                    <MenuOption
                        text="Treatments & Warnings"
                        style={{top: "200px"}}
                        onClick={() => (select("Treatments"))}
                        className={(selected === "Treatments" ? "menu-option-selected" : "")}
                    />
                    <MenuOption
                        text="Reports"
                        style={{top: "240px"}}
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

