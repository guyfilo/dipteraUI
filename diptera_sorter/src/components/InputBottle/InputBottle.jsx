import React, {useEffect, useState} from 'react';
import './style.css';

export const InputBottleOne = ({is_full, bottle_name, height = 51, width = 34}) => {
    const [blink, setBlink] = useState(true);

    useEffect(() => {
        let intervalId;
        if (!is_full) {
            intervalId = setInterval(() => setBlink(prev => !prev), 500);
        } else {
            setBlink(false);
        }
        return () => clearInterval(intervalId);
    }, [is_full]);


    const bottle_icon = !is_full
        ? blink
            ? `/${bottle_name}_blink0.svg`
            : `/${bottle_name}_blink1.svg`
        : `/${bottle_name}.svg`;

    return (
        <div className="input-bottle" style={{width: width, height: height}}>
            <img className="input-bottle-icon" alt="outBottle" src={bottle_icon}/>
        </div>
    );
}

export const InputBottle = ({
                                cleanBottleFull = true, larvaeBottleFull = true,
                                className, height = 51, width = 34
                            }) => {
    return(
    <div className={`input-bottle ${className}`} style={{height: height}}>
        <InputBottleOne bottle_name={"larvae"} is_full={larvaeBottleFull} width={width} height={height}></InputBottleOne>
        <InputBottleOne bottle_name={"clean"} is_full={cleanBottleFull} width={width} height={height}></InputBottleOne>
    </div>)
}
