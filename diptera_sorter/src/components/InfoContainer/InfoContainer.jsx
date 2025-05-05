import React, {useState} from "react";
import "./style.css"

export const InfoContainer = ({title, titleClassName, info, className, children}) => {
    const [show_info, setShowInfo] = useState(false);
    return <div className={`info-container ${className}`}>
        <div className="info-container-title">{title}</div>
        <img className="info-icon" src={show_info? "exit_button.svg" :"/infoIcon.svg"} alt="InfoIcon"
             style={show_info ? {width:14, height:15} : null}
             onClick={() => setShowInfo((prev) => !prev)}></img>
        {show_info ?
            <div className="info-tooltip">
                <div className={"info-tooltip-overlap"}>
                    <dev classname="info-tooltip-text">
                        {":sdfdsfsdf"}
                    </dev>
                </div>
            </div> :
            <div className="info-children">{children}</div>
        }

    </div>
}