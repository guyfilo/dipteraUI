import React, {useContext, useEffect} from "react";
import {ChooseTitle} from "../../components/ChooseTitle/ChooseTitle.jsx";
import "./style.css";
import StatusIcon from "../../components/StatusIcon/StatusIcon.jsx";
import {InputBottle} from "../../components/InputBottle/InputBottle.jsx";
import {OutputBottles} from "../../components/OutputBottle/OutputBottle.jsx";
import WarningIcon from "../../components/WarningsIcon/WarningIcon.jsx";
import PieChart from "../../components/PieChart/PieChart.jsx";
import {InfoContainer} from "../../components/InfoContainer/InfoContainer.jsx";
import {AreaHistogram} from "../../components/AreaHistogram/AreaHistogram.jsx";
import {Gauge} from "../../components/Gauge/Gauge.jsx";
import {CameraImageViewer} from "./CameraImageViewer.jsx";
import {SelectedMachinesContext} from "../../components/SelectedMachinesContext/SelectedMachinesContext.jsx";

const BarcodeComponent = ({barcode, garbage, duplicate_reported, error_msg}) => {
    // error_msg = "scan_again";
    const style = {width: "80px", height: "80px"};
    return (
        <div className="scanner-barcode-container">
            <p className="scanner-big-text" style={{color: error_msg? "#b3261e":null}}>
                {(garbage && !duplicate_reported) ? <img className={"scanner-warning_icon"} alt={"Warning"} src={"/junk.svg"}
                                style={style}></img> : null}
                {duplicate_reported ? <img className={"scanner-warning_icon"} alt={"Warning"} src={"/duplicate.svg"}
                                           style={style}></img> : null}
                {(garbage || duplicate_reported) ? null : barcode}
            </p>
            {error_msg ? <p className={"scanner-barcode-error"} style={{color:"#fc4747"}}>* {error_msg}</p> : null}
        </div>
    )
}

export const ScannerWindow = ({data, sessions}) => {
    const scannerMachines = Object.values(data).filter(d => sessions[d.session_id]?.scanner_mode);
    const [scanner, setScanner] = React.useState(scannerMachines.at(0) || null);
    console.log(scanner);

    const {removeAll, selectMachine} = useContext(SelectedMachinesContext);

    useEffect(() => {
        if (!scanner && scannerMachines.length > 0) {
            setScanner(scannerMachines.at(0));
        }
    }, [data, sessions]);

    useEffect(() => {
        if (scanner) {
            const updated = scannerMachines.find(m => m.machine_id === scanner.machine_id);
            setScanner(updated || scannerMachines.at(0) || null);
        }
    }, [data, sessions]);

    useEffect(() => {
        if (scanner) {
            removeAll();
            selectMachine(scanner.machine_id, true);
            scanner.machine_title = `Scanner ${scanner.machine_id}`;
        }
    }, [scanner]);

    if (!scanner) {
        return (
            <div className="machinesInfoWindow">
                <div className="no-scanner-message">No scanner session</div>
            </div>
        );
    }

    scanner.machine_title = `Scanner ${scanner.machine_id}`;

    return (
        <div className="machinesInfoWindow">
            <div className="choose-machine">
                <ChooseTitle
                    selected={scanner}
                    setSelected={setScanner}
                    options={scannerMachines}
                    title_key={"machine_title"}
                />
            </div>
            <div className="session-title">{sessions[scanner.session_id].session_title}</div>

            <div className="scanner-table-container">
                <table className="scanner-info-table">
                    <tbody>
                    <tr style={{height: "70px"}}>
                        <td className="scanner-total-count" rowSpan={2} style={{width: "195px"}}>
                            <div className="td-container">
                                <p className="cell-header">Larvae scanned</p>
                                <p className="scanner-big-text">{scanner?.scan_data?.total_scans || "0"}</p>
                            </div>
                        </td>
                        <td className="scanner-status" style={{width: "130px"}}>
                            <div className="td-container">
                                <p className="cell-header">Status</p>
                                <StatusIcon
                                    status={scanner.machine_state}

                                    className="scanner-status-icon"
                                />
                            </div>
                        </td>
                        <td className="scanner-running-time" style={{width: "195px"}}>
                            <div className="td-container">
                                <p className="cell-header">Machine Running Time</p>
                                <p>{"8:36"}</p>
                            </div>
                        </td>
                        <td className="scanner-barcode" rowSpan={2} style={{width: "340px"}}>
                            <div className="td-container"
                                 style={scanner?.scan_data?.ready ? {backgroundColor: "rgba(92, 178, 244, 0.1)"} : {}}>
                                <p className="cell-header">Barcode</p>
                                <BarcodeComponent barcode={scanner?.scan_data?.barcode}
                                                  garbage={scanner?.scan_data?.garbage}
                                                  duplicate_reported={scanner?.scan_data?.duplicate_reported}
                                                  error_msg={scanner?.scan_data?.error_msg}
                                >
                                </BarcodeComponent>
                                {/*<p className="scanner-big-text">{selected?.scan_data?.barcode || "nan"}</p>*/}
                            </div>
                        </td>
                        <td className="scanner-warnings" rowSpan={2} style={{width: "195px"}}>
                            <div className="td-container">
                                <p className="cell-header">Duplicate Warning</p>
                                {scanner?.scan_data?.duplicate_detected ?
                                    <img className={"scanner-warning_icon"}
                                         alt={"Warning"}
                                         src={"/dupliocate-warning-red.svg"}
                                         style={{width: "95px"}}></img> :
                                    <img className={"scanner-warning_icon"}
                                         alt={"Warning"}
                                         src={"/duplicate-warning.svg"}
                                         style={{width: "95px"}}></img>
                                }
                            </div>
                        </td>
                    </tr>
                    <tr style={{height: "120px"}}>
                        <td className="scanner-input-bottle">
                            <div className="td-container">
                                <p className="cell-header">Input Bottles</p>
                                <InputBottle
                                    className="scanner-input-bottles-widget"
                                    cleanBottleFull={scanner.water_bottle_state === "Full"}
                                    larvaeBottleFull={scanner.larvae_bottle_state === "Full"}

                                />
                            </div>
                        </td>
                        <td className="scanner-output-bottle">
                            <div className="td-container">
                                <p className="cell-header">Output Bottles</p>
                                <OutputBottles
                                    className="scanner-output-bottles-widget"
                                    target1={sessions[scanner.session_id].target1}
                                    target2={sessions[scanner.session_id].target2}
                                    collectTarget1={scanner.collect_target1}
                                    collectTarget2={scanner.collect_target2}
                                    scanner={true}
                                />
                            </div>
                        </td>
                    </tr>
                    <tr style={{height: "270px"}}>
                        <td colSpan={1}>
                            <div className="td-container" style={{width: "290px"}}>
                                <InfoContainer className={"scanner-dashboard"} info={"pressure inside the tankers"}
                                               title={"Larae Area"}>
                                    <Gauge
                                        style={{width: "220px", height: "220px"}}
                                        val={3}
                                        subArcs={[{limit: 2}, {limit: 3}, {limit: 4}]}
                                        ticks={[{value: 2}, {value: 3}, {value: 4}]}
                                        maxValue={6}
                                    />
                                </InfoContainer>
                            </div>
                        </td>
                        <td colSpan={1} rowSpan={2} style={{left: "95px"}}>
                            <div className="td-container" style={{width: "804px"}}>
                                <p className="cell-header">Larva images</p>
                                <div className={"scanner-images-container"}>
                                    <CameraImageViewer imagesByCam={scanner?.images}></CameraImageViewer>
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr style={{height: "270px"}}>
                        <td colSpan={1}>
                            <div className="td-container" style={{width: "290px"}}>
                                <InfoContainer className={"scanner-dashboard"} info={"pressure inside the tankers"}
                                               title={"Pressure"}>
                                    <Gauge
                                        style={{width: "220px", height: "220px"}}
                                        val={scanner?.pressure?.value ?? 35}
                                        subArcs={[{limit: 30}, {limit: 40}, {limit: 50}]}
                                        ticks={[{value: 30}, {value: 40}, {value: 50}]}
                                        maxValue={60}
                                    />
                                </InfoContainer>
                            </div>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};