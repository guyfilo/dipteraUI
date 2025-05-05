import React, {useContext, useEffect, useState} from "react";
import {InfoContainer} from "../../components/InfoContainer/InfoContainer.jsx";
import {ChooseTitle} from "../../components/ChooseTitle/ChooseTitle.jsx";
import "./style.css"
import {SessionInfoTable} from "../../components/SessionInfoTable/SessionInfoTable.jsx";
import {AreaHistogram} from "../../components/AreaHistogram/AreaHistogram.jsx";
import PieChart from "../../components/PieChart/PieChart.jsx";

import { SelectedMachinesContext } from "../../components/SelectedMachinesContext/SelectedMachinesContext.jsx";

export const SessionInfoWindow = ({ data, sessions }) => {
    const { selectSession, removeAll } = useContext(SelectedMachinesContext);
    const [selected, setSelected] = useState(Object.values(sessions).at(0));

    useEffect(() => {
        if (selected) {
            removeAll(); // clear previous selections
            selectSession(selected.session_id, true); // select only this session
        }
    }, [selected]);
    const machines_data = Object.fromEntries(
        Object.entries(data).filter(
            ([machineId]) => selected.machine_ids.includes(machineId)
        )
    );
    const totalSuccess = Object.values(machines_data)
        .map(machine => machine.success_counter || 0)
        .reduce((a, b) => a + b, 0);

    const getCombinedData = (element) => {
        return Object.values(machines_data).reduce((acc, machine) => {
            const cases = machine[element] || {};
            for (const [key, val] of Object.entries(cases)) {
                acc[key] = (acc[key] || 0) + val;
            }
            return acc;
        }, {});
    }

    const combinedData = {
        loop_case: getCombinedData("loop_case"),
        sex_classifications: getCombinedData("sex_classifications"),
        fl_classifications: getCombinedData("fl_classifications"),
    }


    const totalLoopCases = Object.values(machines_data).reduce((acc, machine) => {
        const cases = machine.loop_case || {};
        for (const [key, val] of Object.entries(cases)) {
            acc[key] = (acc[key] || 0) + val;
        }
        return acc;
    }, {});

    const allLarvaAreas = Object.values(machines_data)
        .flatMap(machine => machine.larva_area || []);

    return <div className="session-info-window">
        <div className="choose-session">
            <ChooseTitle selected={selected} setSelected={setSelected}
                         options={Object.values(sessions)}></ChooseTitle>
        </div>
        <div className="larva-counter">
            <div className="larva-counter-title">Lara Sorted</div>
            <div className="larva-count">{totalSuccess}</div>
        </div>
        <div className="session-live-table">
            <SessionInfoTable session_data={selected} machines_data={machines_data}></SessionInfoTable>
        </div>
        <div className="session-pie">
            <InfoContainer info={"Loops Pie"} title={"Loops Pie"}>
                <PieChart width={350} height={320} selected={combinedData}></PieChart>
            </InfoContainer>
        </div>
        <div className="larva-area-histogram-container">
            <InfoContainer info={"Loops Pie"} title={"Lara Area Histogram"}>
                <AreaHistogram className="area-histogram" width={640} height={320} values={allLarvaAreas}></AreaHistogram>
            </InfoContainer>
        </div>

    </div>
}
