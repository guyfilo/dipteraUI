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
import {ScannerChat} from "./ScannerChat.jsx";
import {Button} from "../../components/Button/index.js";

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

export const ScannerWindow = ({data, sessions, newSessionCbk}) => {
    const scannerMachines = Object.values(data).filter(d => sessions[d.session_id]?.scanner_mode);
    const [scanner, setScanner] = React.useState(scannerMachines.at(0) || null);

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

    // if (!scanner) {
    //     return (
    //         <div className="machinesInfoWindow">
    //             {noSessionButton()}
    //         </div>
    //     );
    // }
    if (scanner) {
        scanner.machine_title = `Scanner ${scanner.machine_id}`;
    }


    return (
        <div className="machinesInfoWindow">
            <div className="choose-machine">
                {scanner? <ChooseTitle
                    selected={scanner}
                    setSelected={setScanner}
                    options={scannerMachines}
                    title_key={"machine_title"}
                /> : "No Scanner"}
            </div>
            <div className="session-title">{scanner ? sessions[scanner.session_id].session_title: "No scanner"}</div>

            <div className="scanner-table-container">
                <table className="scanner-info-table">
                    <tbody>
                    <tr style={{height: "150px"}}>
                        <td className="scanner-status" style={{width: "120px"}}>
                            <div className="scanner-td-container">
                                <p className="cell-header">Status</p>
                                <StatusIcon
                                    status={scanner?.machine_state}
                                    width={50} height={50}
                                    className="scanner-status-icon"
                                />
                            </div>
                        </td>
                        <td className="scanner-total-count" style={{width: "162px"}}>
                            <div className="scanner-td-container">
                                <p className="cell-header">Larvae scanned</p>
                                <p className="scanner-big-text">{scanner?.scan_data?.total_scans || "0"}</p>
                            </div>
                        </td>

                        <td className="scanner-input-bottle" style={{width: "162px"}}>
                            <div className="scanner-td-container">
                                <p className="cell-header">Input Bottles</p>
                                <InputBottle
                                    className="scanner-input-bottles-widget"
                                    cleanBottleFull={scanner ? scanner.water_bottle_state : true }
                                    larvaeBottleFull={scanner ? scanner.larvae_bottle_state : true}
                                    height={80}
                                    width={50}
                                />
                            </div>
                        </td>
                        <td >
                            <div className="scanner-td-container scanner-output-bottle">
                                <p className="cell-header">Output Bottles</p>
                                <OutputBottles
                                    className="scanner-output-bottles-widget"
                                    target1={["male", "female", "fl"]}
                                    target2={["junk"]}
                                    collectTarget1={false}
                                    collectTarget2={false}
                                    scanner={true}
                                    width={"60px"}
                                    height={"100%"}
                                />
                            </div>
                        </td>

                        <td colSpan={1} rowSpan={2}>
                            <div className="scanner-td-container" style={{width: "290px"}}>
                                <InfoContainer className={"scanner-dashboard"} info={"pressure inside the tankers"}
                                               title={"Larvae Size"}>
                                    <Gauge
                                        style={{width: "256px", height: "228px"}}
                                        val={scanner?.mean_larva_area?.value || 0}
                                        subArcs={[{limit: 2}, {limit: 3}, {limit: 4}]}
                                        ticks={[{value: 2}, {value: 3}, {value: 4}]}
                                        maxValue={6}
                                    />
                                </InfoContainer>
                            </div>
                        </td>
                        <td colSpan={1} rowSpan={2}>
                            <div className="scanner-td-container" style={{width: "290px"}}>
                                <InfoContainer className={"scanner-dashboard"} info={"pressure inside the tankers"}
                                               title={"Pressure"}>
                                    <Gauge
                                        style={{width: "256px", height: "228px"}}
                                        val={scanner?.pressure?.value ?? 35}
                                        subArcs={[{limit: 30}, {limit: 40}, {limit: 50}]}
                                        ticks={[{value: 30}, {value: 40}, {value: 50}]}
                                        maxValue={60}
                                    />
                                </InfoContainer>
                            </div>
                        </td>
                    </tr>
                    <tr style={{height: "150px"}}>
                        <td colSpan={4} rowSpan={2}>
                            <div className={"scanner-td-container"}>
                                <ScannerChat messages={scanner?.scanner_message || []}></ScannerChat>
                            </div>

                                <div className={"scanner-td-container"}>
                                    {scanner ?
                                        <ScannerChat messages={scanner?.scanner_message || []}></ScannerChat>
                                        :
                                        <Button
                                            text={"New Scanner Session"}
                                            onClick={newSessionCbk}
                                            style={{
                                                width: "20%",
                                                position: "relative",
                                                top: "50%",
                                            }}
                                        >

                                        </Button>}
                                </div>

                        </td>
                    </tr>
                    <tr style={{height: "380px"}}>
                        <td colSpan={2} rowSpan={1}>
                            <div className="scanner-td-container" style={{ height: "98%"}}>
                                <p className="cell-header">Larva images</p>
                                <div className={"scanner-images-container"}>
                                    <CameraImageViewer imagesByCam={scanner?.images}></CameraImageViewer>
                                </div>
                            </div>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};