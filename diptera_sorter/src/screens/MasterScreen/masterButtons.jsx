import React, {useContext, useState} from 'react';
import "./style.css";
import {DataContext} from "../../communication/DataContext.jsx";

export const MasterButtons = ({selectedMachine}) => {
    const {
        liveData,
        availableMachines,
        createSession,
        endSession,
        sendCommand,
        fetchAvailableMachines,
        sessions,
        isSudoMode
    } = useContext(DataContext);

    const [flowSrc, setFlowSrc] = useState("clean_w");
    const [flowDst, setFlowDst] = useState("target1_out");
    const [flowTime, setFlowTime] = useState(5);
    const [targetPressure, setTargetPressure] = useState(36);
    const [selectedCams, setSelectedCams] = useState([]);

    const cams = ["0", "1", "2", "3", "FL", "NAT"];

    const isAvailable = availableMachines.includes(selectedMachine);
    let inSession = selectedMachine && typeof liveData[selectedMachine]?.session_id === 'string' &&
        liveData[selectedMachine].session_id.trim() !== '';
    const handleStartSession = async () => {
        if (!isAvailable) return;
        await createSession({
            session_id: `SUDO-${selectedMachine}-${Date.now()}`,
            machine_ids: [selectedMachine],
            sudo_mode: true,
            session_title: "Sudo Session",
            session_description: "Sudo session via UI"
        });
    };

    const handleFlowControl = () => {
        sendCommand("set_flow", [selectedMachine], [], {src: flowSrc, dst: flowDst});
    };

    const handleFlowCheck = () => {
        sendCommand("flow_check", [selectedMachine], [], {
            src: flowSrc,
            dst: flowDst,
            wash_time: flowTime,
        });
    };

    const handleSetPressure = () => {
        sendCommand("set_pressure", [selectedMachine], [], {
            target_pressure: targetPressure
        });
    };

    const handleCloseAllValves = () => {
        sendCommand("set_flow", [selectedMachine], [], {src: null, dst: null});
    };

    const handleLightSensorTest = () => {
        sendCommand("test_ls", [selectedMachine], [], {});
    };

    const toggleCamera = (cam) => {
        const cam_name = `cam${cam}`;
        setSelectedCams(prev =>
            prev.includes(cam_name) ? prev.filter(c => c !== cam_name) : [...prev, cam_name]
        );
    };

    const handleCamCommand = (cmd) => {
        sendCommand(cmd, [selectedMachine], [], {cams: selectedCams});
    };

    function handleExit() {
        sendCommand("exit", [selectedMachine], [], {});
    }

    return (
        <div className="master-buttons">
            {isSudoMode() &&
                <div className={"master-button"} onClick={() => sendCommand('reboot',[selectedMachine], [])}>Reboot</div>
            }


            {!inSession && (
                <div className={"master-button"} onClick={handleStartSession}>Start sudo session</div>
            )}

            {inSession && <>
                <div className={"master-flow-ctl expand-button"}>
                    <h3>Flow Control:</h3>
                    <h4>Source</h4>
                    <select className="flow-src" value={flowSrc} onChange={e => setFlowSrc(e.target.value)}>
                        {["clean_w", "larvae_w", "clean_w_backward"].map(src => (
                            <option key={src} value={src}>{src}</option>
                        ))}
                    </select>
                    <h4>Destination</h4>
                    <select className="flow-dst" value={flowDst} onChange={e => setFlowDst(e.target.value)}>
                        {["target1_out", "recycle_out", "junk_out", "target2_out", "backward_out"].map(dst => (
                            <option key={dst} value={dst}>{dst}</option>
                        ))}
                    </select>
                    <div className="master-button master-start-button-0" onClick={handleFlowControl}>
                        Start
                    </div>

                    <h3>Flow Check:</h3>
                    <h4>Time (sec)</h4>
                    <input className="flow-time" type="number" value={flowTime} onChange={e =>
                        setFlowTime(parseFloat(e.target.value))}/>
                    <div className="master-button master-start-button" onClick={handleFlowCheck}>
                        Start
                    </div>
                </div>

                <div className="master-pressure-ctl expand-button">
                    <h3>Set Pressure:</h3>
                    <h4>Target pressure</h4>
                    <input className="target-pressure" type="number" value={targetPressure} onChange={e =>
                        setTargetPressure(parseFloat(e.target.value))}/>
                    <div className="master-button master-start-button" onClick={handleSetPressure}>
                        Start
                    </div>
                </div>

                {isSudoMode() ?
                    <div className={"master-buttons"}>
                        <div className="master-button" onClick={handleCloseAllValves}>Close All Valves</div>

                        <div className="master-button" onClick={handleLightSensorTest}>Light Sensors Test</div>

                        <div className="expand-button">
                            <h3>Cameras:</h3>
                            <div className="master-cameras-grid">
                                {cams.map(id => (
                                    <div
                                        key={id}
                                        className={`master-cameras-grid-item ${selectedCams.includes(`cam${id}`) ? 'selected' : ''}`}
                                        onClick={() => toggleCamera(id)}
                                    >
                                        {`cam${id}`}
                                    </div>
                                ))}
                            </div>
                            <div className="master-button master-start-button"
                                 onClick={() => handleCamCommand("capture")}>Capture
                            </div>
                            <div className="master-button master-start-button-1"
                                 onClick={() => handleCamCommand("test_cams")}>Test
                            </div>
                        </div>
                        <div className="master-button" onClick={handleExit}>Exit Session</div>
                    </div> : null}
            </>}
        </div>
    );
};