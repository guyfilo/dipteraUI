import React from 'react';

import outBottle from "/outBottle.svg"

import "./style.css";

import { useState, useEffect } from "react";

export const OutputBottle = ({ index, male, female, fl, recycle, junk, width, height, collect , empty}) => {
    const [blink, setBlink] = useState(false);

    useEffect(() => {
        let intervalId;
        if (collect) {
            intervalId = setInterval(() => setBlink(prev => !prev), 500);
        } else {
            setBlink(false);
        }
        return () => clearInterval(intervalId);
    }, [collect]);

    let target_icon_path = [];
    if (recycle || junk) {
        recycle ? target_icon_path.push("recycle") : target_icon_path.push("junk");
    } else {
        if (male) target_icon_path.push("male");
        if (female) target_icon_path.push("female");
        if (target_icon_path.length === 0) target_icon_path.push("male", "female");
        target_icon_path.push(fl ? "fl" : "nfl");
    }

    const target_icon = `/${target_icon_path.join("_")}.svg`;
    const bottle_icon = collect
        ? blink
            ? "/outBottle_blink1.svg"
            : "/outBottle_blink2.svg"
        : "/outBottle.svg";

    return (
        <div className="outputBottleRectangle" style={{ width, height: `${height}px`, fontSize: `${0.4 * height}px` }}>
            {!empty ? <img className="target-icon" alt="" src={target_icon}/> : null}
            <b className={collect ? "bottle-number-blink" : "bottle-number"}>{index}</b>
            <img className="output-bottle-icon" alt="outBottle" src={bottle_icon} />
        </div>
    );
};

export const OutputBottles = ({target1 = [], target2 = [], className, height, width, collectTarget1,
                                  collectTarget2, scanner= false}) => {

    return <div className={`outputBottles ${className}`}>
        <div className="output-bottle">
            <OutputBottle index="2"
                          male={target2.includes("male")}
                          female={target2.includes("female")}
                          fl={target2.includes("fl")}
                          width={width}
                          height={height}
                          collect={collectTarget1}
                          empty={scanner}
            />
            <OutputBottle  junk={true} width={width}
                           index=""
                           empty={scanner}
                           height={height}/>
            <OutputBottle  recycle={!scanner} width={width} junk={scanner}
                           index=""
                           height={height}/>
            <OutputBottle index="1"
                          male={scanner || target1.includes("male")}
                          female={scanner || target1.includes("female")}
                          fl={scanner || target1.includes("fl")}
                          width={width}
                          height={height}
                          collect={collectTarget1}
            />
        </div>
    </div>
        ;
}
