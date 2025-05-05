import React, {useState, useEffect} from "react";

import "./style.css";
import {Checkbox} from "../Checkbox/index.jsx";

export const SelectTarget = ({selectedTarget, setSelectedTarget}) => {



    const targets = {
        "male_fl": "Male Fluorescent",
        "male_nfl": "Male",
        "female_fl": "Female Fluorescent",
        "female_nfl": "Female",
        "male_female_fl": "Male & Female Fluorescent",
        "male_female_nfl": "Male & Female",
    };
    return (<div className="select-target">
        {Object.entries(targets).map(([target, target_title]) => (
            <div className="select-target-line-wrapper">
                <div className="select-target-line" key={target}>
                    <Checkbox
                        toggle={true}
                        className={`select-target-checkbox`}
                        id={target}
                        boolVar={selectedTarget === target}
                        setBoolVar={(checked) => setSelectedTarget(checked ? target : null)}
                    />
                    <img className={`select-target-icon ${target}_icon`} alt={target}
                         src={`/${target}.svg`}></img>
                    <p className={"target-title"}>{target_title}</p>
                </div>
            </div>
        ))}
    </div>)
}