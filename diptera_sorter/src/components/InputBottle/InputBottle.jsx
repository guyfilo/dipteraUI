import React, {useEffect, useState} from 'react';
import './style.css';

export const InputBottleOne = ({state, bottle_name, height = 51, width = 34}) => {
    const [blink, setBlink] = useState(true);
    let is_empty = state && (state === "Empty")
    useEffect(() => {
        let intervalId;
        if (is_empty) {
            intervalId = setInterval(() => setBlink(prev => !prev), 500);
        } else {
            setBlink(false);
        }
        return () => clearInterval(intervalId);
    }, [is_empty]);
    const [onHover, setOnHover] = useState(false);


    const bottle_icon = is_empty
        ? blink
            ? `/${bottle_name}_blink0.svg`
            : `/${bottle_name}_blink1.svg`
        : `/${bottle_name}.svg`;

    return (
        <div className="input-bottle" style={{width: width, height: height}}>
            <img className="input-bottle-icon" alt="outBottle" src={bottle_icon}
                 onMouseEnter={()=>{setOnHover(true)}}
                 onMouseLeave={()=>{setOnHover(false)}}
            />
            {onHover? <div className={"default-tooltip"}>{bottle_name}</div>:null
            }
        </div>
    );
}

export const InputBottle = ({
                                cleanBottleFull = "Full", larvaeBottleFull = "Full",
                                className, height = 51, width = 34
                            }) => {
    const [onHover, setOnHover] = useState(false);

    return(
    <div className={`input-bottle ${className}`} style={{height: height}}>
        <InputBottleOne bottle_name={"larvae"} state={larvaeBottleFull} width={width} height={height}></InputBottleOne>
        <InputBottleOne bottle_name={"clean"} state={cleanBottleFull} width={width} height={height}></InputBottleOne>
    </div>)
}
