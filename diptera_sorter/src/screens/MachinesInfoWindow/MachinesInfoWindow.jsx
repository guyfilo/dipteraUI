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


export const MachinesInfoWindow = ({machines_data, sessions}) => {
    let data = Object.fromEntries(
        Object.entries(machines_data).filter(([_, machine]) => machine?.session_id)
    );
    const {removeAll, selectMachine} = useContext(SelectedMachinesContext);
    const [machine, setMachine] = React.useState(Object.values(data).at(0));
    useEffect(() => {
        if (machine && data[machine.machine_id]) {
            setMachine(data[machine.machine_id]);  // update machine if still exists
        } else if (Object.keys(data).length > 0) {
            setMachine(Object.values(data)[0]);  // fallback to another available machine
        }
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
    let inSession = machine?.session_id && Object.keys(sessions).includes(machine.session_id);
    return (
        <div className="machinesInfoWindow">
            <div className="choose-machine">
                <ChooseTitle selected={machine} setSelected={setMachine}
                             options={Object.values(data)} title_key={"machine_title"}></ChooseTitle>
            </div>
            <div className="machine-session-title">{inSession ? sessions[machine.session_id].session_title : null}</div>
            <div className="machine-table-container">
                <table className="machine-info-table">
                    <tbody>
                    <tr style={{height: "92px"}}>
                        <td style={{width: "150px"}}>
                            <div className="td-container machine-target-counter">
                                <p className="cell-header-machine">Target1</p>
                                <p className="larva-target-count-text">{machine?.target1_counter}</p>
                            </div>
                        </td>
                        <td style={{width: "150px"}}>
                            <div className="td-container machine-target-counter">
                                <p className="cell-header-machine">Target2</p>
                                <p className="larva-target-count-text">{machine?.target2_counter}</p>
                            </div>
                        </td>
                        <td rowSpan={2}>
                            <div className="td-container machine-status">

                                <p className="cell-header-machine">Status</p>
                                <StatusIcon status={machine.machine_state} width={90} height={90}
                                            className="machine-status-icon"></StatusIcon>
                            </div>

                        </td>

                        <td className="" rowSpan={2}>
                            <div className="td-container machine-input-bottle">

                                <p className="cell-header-machine">Input Bottles</p>
                                <InputBottle
                                    className="machine-input-bottles-widget"
                                    cleanBottleFull={machine.water_bottle_state}
                                    larvaeBottleFull={machine.larvae_bottle_state}
                                    height={100}
                                    width={70}
                                ></InputBottle>
                            </div>

                        </td>
                        <td className="" rowSpan={2}>
                            <div className="td-container machine-output-bottle">

                                <p className="cell-header-machine">Output Bottles</p>

                                <OutputBottles
                                    className="machine-output-bottles-widget"
                                    target1={inSession ? sessions[machine.session_id]?.target1 : []}
                                    target2={inSession ? sessions[machine.session_id]?.target2 : []}
                                    collectTarget1={machine.collect_target1}
                                    collectTarget2={machine.collect_target2}
                                    width={"60px"}
                                    height={"100%"}
                                ></OutputBottles>
                            </div>
                        </td>
                        <td rowSpan={3} style={{width: "290px"}}>
                            <div className=" td-container machine-dashboard-gauge">
                                <InfoContainer info={"pressure inside the tankers"} title={"Pressure"}>
                                    <Gauge style={{width: "200px", height: "130px", left: "25px", position: "relative"}}
                                           subArcs={[{limit: 30}, {limit: 40}, {limit: 50}]}
                                           warning={machine?.pressure?.warning}

                                           ticks={[{value: 30}, {value: 40}, {value: 50}]}
                                           maxValue={60}
                                    ></Gauge>
                                </InfoContainer>
                                <InfoContainer info={"sorts per minute"} title={"Sorting Rate"}>
                                    <Gauge style={{width: "200px", height: "130px", left: "25px", position: "relative"}}
                                           val={machine?.sorting_rate?.value}
                                           warning={machine?.sorting_rate?.warning}
                                           subArcs={[{limit: 10}, {limit: 30}, {limit: 50}, {limit: 70}]}
                                           maxValue={70}
                                           ticks={[{value: 10}, {value: 30}, {value: 50}]}
                                    ></Gauge>
                                </InfoContainer>
                                <InfoContainer info={"time the system wait for new larva"} title={"Waiting Time"}>
                                    <Gauge style={{width: "200px", height: "130px", left: "25px", position: "relative"}}
                                           val={machine?.waiting_time?.value}
                                           warning={machine?.waiting_time?.warning}

                                           subArcs={[{limit: 0.2}, {limit: 0.8}, {limit: 1.5}]} maxValue={2}
                                           ticks={[{value: 0.2}, {value: 0.8}, {value: 1}]}
                                    ></Gauge>
                                </InfoContainer>
                            </div>
                        </td>
                    </tr>

                    <tr style={{height: "109px"}}>
                        <td colSpan={2}>
                            <div className="td-container machine-larva-counter">
                                <p className="cell-header-machine">Larva Sorted</p>
                                <p className="larva-count-text">{machine?.success_counter}</p>
                            </div>
                        </td>


                    </tr>
                    <tr style={{height: "480px"}}>
                        <td className="machine-pie" colSpan={3}>
                            <div className="td-container machine-pie" style={{width: "450px"}}>

                                <InfoContainer info={"Loops Pie"} title={"Loops Pie"}>
                                    <PieChart
                                        width={400}
                                        height={300}
                                        selected={machine}
                                    />
                                </InfoContainer>
                            </div>
                        </td>
                        <td className="machine-histogram" colSpan={2} style={{left: "-100px"}}>
                            <div className="td-container machine-histogram" style={{width: "630px"}}>

                                <InfoContainer info={"Histogram"} title={"Histogram"}>
                                    <AreaHistogram width={550} height={340} values={machine.larva_area}></AreaHistogram>
                                </InfoContainer>
                            </div>
                        </td>
                    </tr>
                    {/*<tr>*/}
                    {/*    <td colSpan={4}>*/}
                    {/*        <div className="machine-dashboard">*/}
                    {/*            <div className="machine-dashboard-gauge">*/}
                    {/*                <InfoContainer info={"pressure inside the tankers"} title={"Pressure"}>*/}
                    {/*                    <Gauge style={{width: "250px", height: "250px"}} val={machine?.pressure?.value}*/}
                    {/*                           subArcs={[{limit: 30}, {limit: 40}, {limit: 50}]}*/}
                    {/*                           warning={machine?.pressure?.warning}*/}

                    {/*                           ticks={[{value: 30}, {value: 40}, {value: 50}]}*/}
                    {/*                           maxValue={60}*/}
                    {/*                    ></Gauge>*/}
                    {/*                </InfoContainer>*/}
                    {/*            </div>*/}
                    {/*            <div className="machine-dashboard-gauge">*/}
                    {/*                <InfoContainer info={"sorts per minute"} title={"Sorting Rate"}>*/}
                    {/*                    <Gauge style={{width: "250px", height: "250px"}}*/}
                    {/*                           val={machine?.sorting_rate?.value}*/}
                    {/*                           warning={machine?.sorting_rate?.warning}*/}
                    {/*                           subArcs={[{limit: 10}, {limit: 30}, {limit: 50}, {limit: 70}]}*/}
                    {/*                           maxValue={70}*/}
                    {/*                           ticks={[{value: 10}, {value: 30}, {value: 50}]}*/}
                    {/*                    ></Gauge>*/}
                    {/*                </InfoContainer>*/}
                    {/*            </div>*/}
                    {/*            <div className="machine-dashboard-gauge">*/}

                    {/*            </div>*/}
                    {/*        </div>*/}
                    {/*    </td>*/}
                    {/*</tr>*/}
                    </tbody>
                </table>
            </div>


        </div>
    )
}