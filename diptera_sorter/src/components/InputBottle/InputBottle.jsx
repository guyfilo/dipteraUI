import React from 'react';
import cleanBottle from "./cleanBottle.svg"
import cleanBottleBlink1 from "./cleanBottleBlink1.svg"
import cleanBottleBlink2 from "./cleanBottleBlink2.svg"
import larvaBottle from "./larvaBottle.svg"
import gif from "./laraWaterGif.gif"
import larvaBottleBlink1 from "./larvaBottleBlink1.svg"
import larvaBottleBlink2 from "./larvaBottleBlink2.svg"
import './style.css';

export const InputBottle = ({cleanBottleFull = false, larvaeBottleFull = false,
                            className, height=51, width=34}) => {
    return <div className={`input-bottle ${className}`} style={{height:height}}>
        {larvaeBottleFull ? <img className="larva_bottle_icon" src={larvaBottle} alt="larva bottle" style={{height:height, width:width}}/> :
        <img className="larva_bottle_icon blink" src={gif} alt="larva bottle" style={{height:height, width:width}}/>}
        {cleanBottleFull ? <img className="clean_bottle_icon" src={cleanBottle} alt="clean bottle" style={{height:height, width:width}}/> :
            <img className="clean_bottle_icon blink" src={cleanBottleBlink2} alt="larva bottle" style={{height:height, width:width}}/>}
    </div>;
}
