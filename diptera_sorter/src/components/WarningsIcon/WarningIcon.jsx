import { FunctionComponent } from 'react';
import "./style.css";
const WarningIcon = ({isError, warnings = [], className}) => {
    return (
        <div className={`warnings-icon ${className}`}>
            <img className="warning-bound" alt=""
                 src={isError ? "/error-bound.svg": "/warning-bound.svg"}/>
            <b className="warning-icon-text">!</b>
            <img className="warning-count-bound" alt="" src="/warning_count_bound.svg" />
            <b className="warning-count-text">{warnings.length}</b>
            <div className="warning-tooltip">
                {warnings.length > 0 ? (
                    Object.values(warnings).map((warning, index) => <p key={index}>-{warning}</p>)
                ) : (
                    <p>No warnings</p>
                )}
            </div>
        </div>);
};
export default WarningIcon;
