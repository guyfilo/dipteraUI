import React, {useContext, useState} from "react";
import {SessionHomeTable} from "../../components/SessionHomeTable/SessionHomeTable.jsx";
import "./style.css";
import {Checkbox} from "../../components/Checkbox/index.jsx";
import {SelectedMachinesContext} from "../../components/SelectedMachinesContext/SelectedMachinesContext.jsx";


export const SessionsHomeView = ({data, sessions}) => {
    const { selectSession, selectedSessions , selectAll} = useContext(SelectedMachinesContext);
    const allSelected=selectedSessions.length === sessions.length;


    return <div className="sessions-home-view">
        <Checkbox text={"Choose All Machines"}
                  textClassName={"choose-all-sessions-text"}
                  setBoolVar={selectAll}
                  boolVar={allSelected}
        ></Checkbox>
        {Object.values(sessions).map(session => (
            <SessionHomeTable session_data={session} machines_data={data} />
        ))}
    </div>;
}