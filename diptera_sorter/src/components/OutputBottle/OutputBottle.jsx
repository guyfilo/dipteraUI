import React from 'react';

import outBottle from "/outBottle.svg"

import "./style.css";

import { useState, useEffect } from "react";

export const OutputBottle = ({ index, male, female, fl, nfl, recycle,
                                 junk, width, height, collect , empty,
                                 onClick, onMouseLeave}) => {
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
    const [onHover, setOnHover] = useState(false);

    let target_icon_path = [];
    let tooltipText = []
    if (recycle || junk) {
        recycle ? target_icon_path.push("recycle") : target_icon_path.push("junk");
    } else {
        if (male) target_icon_path.push("male");
        if (female) target_icon_path.push("female");
        if (target_icon_path.length === 0) target_icon_path.push("male", "female");
        if (fl) target_icon_path.push("fl");
        if (nfl) target_icon_path.push("nfl");
    }
    if (recycle || junk) {
        recycle ? tooltipText.push("Recycle") : tooltipText.push("Junk");
    } else {
        if (male) tooltipText.push("Male");
        if (female) tooltipText.push("Female");
        if (tooltipText.length === 0) tooltipText.push("Male", "Female");
        if (fl) tooltipText.push("Florescent");
        if (nfl) tooltipText.push("not Florescent");
    }

    const target_icon = `/${target_icon_path.join("_")}.svg`;
    const bottle_icon = collect
        ? blink
            ? "/outBottle_blink1.svg"
            : "/outBottle_blink2.svg"
        : "/outBottle.svg";

    return (
        <div className="outputBottleRectangle" style={{ width, height: `${height}px`, fontSize: `${0.4 * height}px` }}
             onClick={onClick} onMouseLeave={onMouseLeave}>
            {!empty ? <img className="target-icon" alt="" src={target_icon}/> : null}
            <b className={collect ? "bottle-number-blink" : "bottle-number"}>{index}</b>
            <img className="output-bottle-icon" alt="outBottle" src={bottle_icon}
                 onMouseEnter={()=>{setOnHover(true)}}
                 onMouseLeave={()=>{setOnHover(false)}}
            />
            {onHover? <div className={"default-tooltip"}>{tooltipText.join(" & ")}</div>:null
            }
        </div>
    );
};

export const OutputBottles = ({
                                  target1 = [],
                                  target2 = [],
                                  className,
                                  height,
                                  width,
                                  collectTarget1,
                                  collectTarget2,
                                  scanner = false,
                                  machineData = {}
                              }) => {

    const [selectedBottle, setSelectedBottle] = useState(null);

    // Compute dynamic info for a bottle based on type
    const getBottleInfo = (type) => {
        if (!machineData) return null;

        switch (type) {
            case "target1":
                return {
                    target1_bottle_counter: machineData.target1_bottle_counter ?? 0,
                    target1_interval_counter: machineData.target1_interval_counter ?? 0,
                    target1_counter: machineData.target1_counter ?? 0,
                };
            case "target2":
                return {
                    target2_bottle_counter: machineData.target2_bottle_counter ?? 0,
                    target2_interval_counter: machineData.target2_interval_counter ?? 0,
                    target2_counter: machineData.target2_counter ?? 0,
                };
            case "junk":
                return {
                    junk_counter: machineData.junk_counter ?? 0,
                };
            case "recycle":
                return {
                    recycle_counter:
                        (machineData.larvae_counter ?? 0)
                        - (machineData.junk_counter ?? 0)
                        - (machineData.target1_counter ?? 0)
                        - (machineData.target2_counter ?? 0),
                };
            default:
                return null;
        }
    };

    const renderBottleInfo = () => {
        if (!selectedBottle) return null;
        const info = getBottleInfo(selectedBottle);
        if (!info) return null;

        return (
            <div className="bottle-info-popup">
                <h4>{selectedBottle.toUpperCase()} Info</h4>
                <ul>
                    {Object.entries(info).map(([key, value]) => (
                        <li key={key}><b>{key}:</b> {value}</li>
                    ))}
                </ul>
            </div>
        );
    };

    return (
        <div className={`outputBottles ${className}`}>
            <div className="output-bottle">
                <OutputBottle
                    index="2"
                    male={target2?.includes("male")}
                    female={target2?.includes("female")}
                    fl={target2?.includes("fl")}
                    nfl={target2?.includes("nfl")}
                    width={width}
                    height={height}
                    collect={collectTarget2}
                    empty={scanner}
                    onClick={() => setSelectedBottle("target2")}
                    onMouseLeave={() => setSelectedBottle(null)}

                />
                <OutputBottle
                    junk={true}
                    width={width}
                    index=""
                    empty={scanner}
                    height={height}
                    onClick={() => setSelectedBottle("junk")}
                    onMouseLeave={() => setSelectedBottle(null)}

                />
                <OutputBottle
                    recycle={!scanner}
                    width={width}
                    junk={scanner}
                    index=""
                    height={height}
                    onClick={() => setSelectedBottle("recycle")}
                    onMouseLeave={() => setSelectedBottle(null)}

                />
                <OutputBottle
                    index="1"
                    male={scanner || target1?.includes("male")}
                    female={scanner || target1?.includes("female")}
                    fl={scanner || target1?.includes("fl")}
                    nfl={scanner || target1?.includes("nfl")}
                    width={width}
                    height={height}
                    collect={collectTarget1}
                    onClick={() => setSelectedBottle("target1")}
                    onMouseLeave={() => setSelectedBottle(null)}

                />
            </div>

            {renderBottleInfo()}
        </div>
    );
};

