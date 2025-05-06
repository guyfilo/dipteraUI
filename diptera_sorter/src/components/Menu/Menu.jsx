import React from "react";
import "./style.css";
import { MenuOption } from "../MenuOption";

export const Menu = ({ className, divClassName, selected, setSelected }) => {
    const select = setSelected;

    return (
        <div className={`menu ${className}`}>
            <div className="group">
                <div className="menu-contener">
                    <div className="rectangle" />
                    <MenuOption
                        text="Home"
                        style={{ top: "10%" }}
                        onClick={() => select("Home")}
                        className={selected === "Home" ? "menu-option-selected" : ""}
                    />
                    <div className={"header-menu-option"} style={{ top: "20%" }}>
                        Dashboards
                    </div>

                    <MenuOption
                        text="Sessions"
                        style={{ top: "30%", left: "25%" }}
                        onClick={() => select("Sessions")}
                        className={selected === "Sessions" ? "menu-option-selected" : ""}
                    />
                    <MenuOption
                        text="Machines"
                        style={{ top: "40%", left: "25%" }}
                        onClick={() => select("Machines")}
                        className={selected === "Machines" ? "menu-option-selected" : ""}
                    />
                    <MenuOption
                        text="Scanner"
                        style={{ top: "50%" , left: "25%"}}
                        onClick={() => select("Scanner")}
                        className={selected === "Scanner" ? "menu-option-selected" : ""}
                    />
                    <MenuOption
                        text="Treatments & Warnings"
                        style={{ top: "60%" }}
                        onClick={() => select("Treatments")}
                        className={selected === "Treatments" ? "menu-option-selected" : ""}
                    />
                    <MenuOption
                        text="Reports"
                        style={{ top: "70%" }}
                        onClick={() => select("Reports")}
                        className={selected === "Reports" ? "menu-option-selected" : ""}
                    />
                </div>
            </div>

            <div className="overlap-wrapper">
                <div className="overlap">
                    <MenuOption
                        text="Guided Help"
                        style={{ top: "3vh" }}
                        onClick={() => select("Guided Help")}
                        className={selected === "Guided Help" ? "menu-option-selected" : ""}
                    />
                    <MenuOption
                        text="Master Mode"
                        style={{ top: "8vh" }}
                        onClick={() => select("Master Mode")}
                        className={selected === "Master Mode" ? "menu-option-selected" : ""}
                    />
                </div>
            </div>
        </div>
    );
};
