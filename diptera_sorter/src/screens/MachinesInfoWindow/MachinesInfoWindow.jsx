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
import {SelectedMachinesContext} from "../../components/SelectedMachinesContext/SelectedMachinesContext.jsx";


export const MachinesInfoWindow = ({data, sessions}) => {
    const {removeAll, selectMachine} = useContext(SelectedMachinesContext);
    const [machine, setMachine] = React.useState(Object.values(data).at(0));
    useEffect(() => {
        removeAll();
        setMachine(data[machine.machine_id]);
    }, [data]);
    useEffect(() => {
        if (!machine && Object.keys(data).length > 0) {
            setMachine(Object.values(data).at(0));
        }
    }, [data]);
    machine.machine_title = `Machine ${machine.machine_id}`;

    useEffect(() => {
        removeAll();
        selectMachine(machine.machine_id, true);
    }, [machine]);
    return (
        <div className="machinesInfoWindow">
            <div className="choose-machine">
                <ChooseTitle selected={machine} setSelected={setMachine}
                             options={Object.values(data)} title_key={"machine_title"}></ChooseTitle>
            </div>
            <div className="session-title">{sessions[machine.session_id].session_title}</div>
            <table className="machine-info-table">
                <tbody>
                <tr>
                    <td className="machine-status">
                        <p className="cell-header">Status</p>
                        <StatusIcon status={machine.machine_state} width={70} height={62}
                                    className="machine-status-icon"></StatusIcon>
                    </td>
                    <td className="machine-larva-counter">
                        <p className="cell-header">Larva Sorted</p>
                        <p className="larva-count-text">{machine.success_counter}</p>
                    </td>
                    <td className="machine-input-bottle">
                        <p className="cell-header">Input Bottles</p>
                        <InputBottle
                            className="machine-input-bottles-widget"
                            cleanBottleFull={machine.water_bottle_state === "Full"}
                            larvaeBottleFull={machine.larvae_bottle_state === "Full"}
                            height="80px"
                            width="60px"
                        ></InputBottle>
                    </td>
                    <td className="machine-output-bottle">
                        <p className="cell-header">Output Bottles</p>

                        <OutputBottles
                            className="machine-output-bottles-widget"
                            target1={sessions[machine.session_id].target1}
                            target2={sessions[machine.session_id].target2}
                            collectTarget1={machine.collect_target1}
                            collectTarget2={machine.collect_target2}
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
                                width={300}
                                height={300}
                                selected={machine}
                            />
                        </InfoContainer>
                    </td>
                    <td className="machine-histogram" colSpan={3}>
                        <InfoContainer info={"Histogram"} title={"Histogram"}>
                            <AreaHistogram width={600} height={340} values={machine.larva_area}></AreaHistogram>
                        </InfoContainer>
                    </td>
                </tr>
                <tr>
                    <td colSpan={5}>
                        <div className="machine-dashboard">
                            <div className="machine-dashboard-gauge">
                                <InfoContainer info={"pressure inside the tankers"} title={"Pressure"}>
                                    <Gauge style={{width: "250px", height: "250px"}} val={machine?.pressure?.value}
                                           subArcs={[{limit: 30}, {limit: 40}, {limit: 50}]}
                                           warning={machine?.pressure?.warning}

                                           ticks={[{value: 30}, {value: 40}, {value: 50}]}
                                           maxValue={60}
                                    ></Gauge>
                                </InfoContainer>
                            </div>
                            <div className="machine-dashboard-gauge">
                                <InfoContainer info={"sorts per minute"} title={"Sorting Rate"}>
                                    <Gauge style={{width: "250px", height: "250px"}}
                                           val={machine?.sorting_rate?.value}
                                           warning={machine?.sorting_rate?.warning}
                                           subArcs={[{limit: 10}, {limit: 30}, {limit: 50}, {limit: 70}]}
                                           maxValue={70}
                                           ticks={[{value: 10}, {value: 30}, {value: 50}]}
                                    ></Gauge>
                                </InfoContainer>
                            </div>
                            <div className="machine-dashboard-gauge">
                                <InfoContainer info={"time the system wait for new larva"} title={"Waiting Time"}>
                                    <Gauge style={{width: "250px", height: "250px"}}
                                           val={machine?.waiting_time?.value}
                                           warning={machine?.waiting_time?.warning}

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