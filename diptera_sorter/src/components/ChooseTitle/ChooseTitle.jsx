import React, {useState} from "react";
import {useEffect} from "react";
import "./style.css";

export const ChooseTitle = ({options, selected, setSelected, title_key="session_title"}) => {
    const [curSelectedIndex, setCurSelectedIndex] = useState(0);  // State for tracking index
    const increase = () => {
        setCurSelectedIndex((prevIndex) => {
            const nextIndex = (prevIndex + 1) % options.length;
            setSelected(options[nextIndex]); // Update selected option
            return nextIndex;  // Return the updated index
        });
    };

    const decrease = () => {
        setCurSelectedIndex((prevIndex) => {
            const prevIndexFixed = (prevIndex - 1 + options.length) % options.length;
            setSelected(options[prevIndexFixed]); // Update selected option
            return prevIndexFixed;  // Return the updated index
        });
    };
    return (<div className="choose-title">
        <img className="choose-left" src="/choose-left.svg" alt="<"
             onClick={decrease}></img>
        <div className="choose-title-text">{selected[title_key]}</div>
        <img className="choose-right" src="/choose-right.svg" alt=">"
             onClick={increase}></img>

    </div>)
}