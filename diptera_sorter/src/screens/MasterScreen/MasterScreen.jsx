import React, {useContext, useState} from "react";
import {DataContext} from "../../communication/DataContext.jsx";
import {Button} from "../../components/Button/index.js";
import StatusIcon from "../../components/StatusIcon/StatusIcon.jsx";
import {MachineTableRow} from "../../components/MachineTableRow/MachineTableRow.jsx";
import "./style.css";
import {SelectedMachinesContext} from "../../components/SelectedMachinesContext/SelectedMachinesContext.jsx";

export const MasterPage = () => {
    const {liveData, availableMachines, createSession, fetchAvailableMachines, sendCommand} = useContext(DataContext);
    const [selectedAvailableMachines, setSelectedAvailableMachines] = useState([]);
    const [src, setSrc] = useState("");
    const [dst, setDst] = useState("");
    const [washTime, setWashTime] = useState(5);
    const [pressure1, setPressure1] = useState("");
    const [pressure2, setPressure2] = useState("");

    const toggleMachineSelection = (id) => {
        setSelectedAvailableMachines(prev =>
            prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
        );
    };

    const {
        selectedMachines,
    } = useContext(SelectedMachinesContext);

    const handleCreateFlowSession = async () => {
        await createSession({
            session_id: `flow_${Date.now()}`,
            session_title: "FLOW",
            machine_ids: selectedMachines,
            flow_mode: true,
            session_description:"",
            target1:[],
            target2:[],
            target1_quanta:0,
            target2_quanta:0,
            wash_mode:false,
            scanner_mode:false,
            specie:"",
        });
    };

    return (
        <div className="master-page">
            {/* Machine Table */}
            <table>

                <thead>
                <tr>
                    <th>Machine</th>
                    <th>Status</th>
                </tr>
                </thead>
                <tbody>
                {Object.entries(liveData).map(([id, machine]) => (
                    <tr key={id}>
                        <td>{<MachineTableRow machineId={id}/>}</td>
                        <td>{<StatusIcon status={machine.machine_state}/>}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            <div className={"flow-control"} >
                {/* Available Machines for Flow */}
                <h2>Create Flow Session</h2>
                {availableMachines.map(mid => (
                    <div key={mid}>
                        <input type="checkbox" onChange={() => toggleMachineSelection(mid)}
                               checked={selectedMachines.includes(mid)}/>
                        {mid}
                    </div>
                ))}
                <Button text="Create Flow Session" onClick={handleCreateFlowSession}/>
                <Button text="Refresh Machines" onClick={fetchAvailableMachines}/>

                {/* Flow Buttons */}
                <h2>Flow Controls</h2>
                <div>
                    <label>

                        Src:
                        <select value={src} onChange={e => setSrc(e.target.value)}>
                            <option value="">-- Select --</option>
                            <option value="larvae_w">Larvae</option>
                            <option value="clean_w">Clean</option>
                            <option value="clean_w_backward">Backward</option>
                        </select>
                    </label>

                    <label>
                        Dst:
                        <select value={dst} onChange={e => setDst(e.target.value)}>
                            <option value="">-- Select --</option>
                            <option value="target1_out">target1</option>
                            <option value="target2_out">target2</option>
                            <option value="recycle_out">recycle</option>
                            <option value="junk_out">junk</option>
                            <option value="backward_out">backward</option>
                        </select>
                    </label>
                    <Button text="Set Flow"
                            onClick={() => sendCommand("set_flow", selectedMachines, null, {src, dst})}/>
                </div>

                <div>
                    <label>Wash Time: <input type="number" value={washTime}
                                             onChange={e => setWashTime(parseFloat(e.target.value))}/></label>
                    <Button text="Flow Check" onClick={() => sendCommand("flow_check", selectedMachines, [], {
                        src:src,
                        dst: dst,
                        wash_time: washTime
                    })}/>
                </div>
                <div>
                    <Button text="close all valves" onClick={() => sendCommand("pause", selectedMachines, [], {})}/>
                </div>
                <div>
                    <label>P1: <input type="number" value={pressure1}
                                      onChange={e => setPressure1(e.target.value)}/></label>
                    <Button text="Set Pressure" onClick={() => sendCommand("set_pressure", selectedMachines, [], {
                        target_pressure: parseFloat(pressure1)
                    })}/>
                </div>

            </div>
        </div>
    );
};