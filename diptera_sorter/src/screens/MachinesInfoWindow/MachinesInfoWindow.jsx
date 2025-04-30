import React, {useEffect} from "react";
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


export const MachinesInfoWindow = ({data, sessions}) => {

    const [selected, setSelected] = React.useState(Object.values(data).at(0));
    useEffect(() => {
        setSelected(data[selected.machine_id]);
    }, [data]);
    useEffect(() => {
        if (!selected && Object.keys(data).length > 0) {
            setSelected(Object.values(data).at(0));
        }
    }, [data]);
    selected.machine_title = `Machine ${selected.machine_id}`;
    return (
        <div className="machinesInfoWindow">
            <div className="choose-machine">
                <ChooseTitle selected={selected} setSelected={setSelected}
                             options={Object.values(data)} title_key={"machine_title"}></ChooseTitle>
            </div>
            <div className="session-title">{sessions[selected.session_id].session_title}</div>
            <table className="machine-info-table">
                <tbody>
                <tr>
                    <td className="machine-status">
                        <p className="cell-header">Status</p>
                        <StatusIcon status={selected.machine_state} width={70} height={62}
                                    className="machine-status-icon"></StatusIcon>
                    </td>
                    <td className="machine-larva-counter">
                        <p className="cell-header">Larva Sorted</p>
                        <p className="larva-count-text">{selected.success_counter}</p>
                    </td>
                    <td className="machine-input-bottle">
                        <p className="cell-header">Input Bottles</p>
                        <InputBottle
                            className="machine-input-bottles-widget"
                            cleanBottleFull={selected.water_bottle_state === "Full"}
                            larvaeBottleFull={selected.larvae_bottle_state === "Full"}
                            height="80px"
                            width="60px"
                        ></InputBottle>
                    </td>
                    <td className="machine-output-bottle">
                        <p className="cell-header">Output Bottles</p>

                        <OutputBottles
                            className="machine-output-bottles-widget"
                            target1={sessions[selected.session_id].target1}
                            target2={sessions[selected.session_id].target2}
                            collectTarget1={selected.collect_target1}
                            collectTarget2={selected.collect_target2}
                            height={52}
                            width={37}
                        ></OutputBottles>
                    </td>
                    <td className="machine-warnings">
                        <p className="cell-header">Warnings</p>
                    </td>
                </tr>
                <tr>
                    <td className="machine-pie" colSpan={2}>
                        <InfoContainer info={"Loops Pie"} title={"Loops Pie"}>
                            <PieChart
                                width={360}
                                height={340}
                                selected={selected}
                            />
                        </InfoContainer>
                    </td>
                    <td className="machine-histogram" colSpan={3}>
                        <InfoContainer info={"Histogram"} title={"Histogram"}>
                            <AreaHistogram width={600} height={340} values={selected.larva_area}></AreaHistogram>
                        </InfoContainer>
                    </td>
                </tr>
                <tr>
                    <td colSpan={5}>
                        <div className="machine-dashboard">
                            <div className="machine-dashboard-gauge">
                                <InfoContainer info={"pressure inside the tankers"} title={"Pressure"}>
                                    <Gauge style={{width: "250px", height: "250px"}} val={selected?.pressure.value}
                                           subArcs={[{limit: 30}, {limit: 40}, {limit: 50}]}
                                           ticks={[{value: 30}, {value: 40}, {value: 50}]}
                                           maxValue={60}
                                    ></Gauge>
                                </InfoContainer>
                            </div>
                            <div className="machine-dashboard-gauge">
                                <InfoContainer info={"sorts per minute"} title={"Sorting Rate"}>
                                    <Gauge style={{width: "250px", height: "250px"}}
                                           val={selected?.sorting_rate.value}
                                           subArcs={[{limit: 10}, {limit: 30}, {limit: 50}, {limit: 70}]}
                                           maxValue={70}
                                           ticks={[{value: 10}, {value: 30}, {value: 50}]}
                                    ></Gauge>
                                </InfoContainer>
                            </div>
                            <div className="machine-dashboard-gauge">
                                <InfoContainer info={"time the system wait for new larva"} title={"Waiting Time"}>
                                    <Gauge style={{width: "250px", height: "250px"}}
                                           val={selected?.waiting_time.value}
                                           subArcs={[{limit: 0.2}, {limit: 0.8}, {limit: 1.5}]} maxValue={2}
                                           ticks={[{value: 0.2}, {value: 0.8}, {value: 1}]}
                                    ></Gauge>
                                </InfoContainer>
                            </div>
                        </div>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
    )
}