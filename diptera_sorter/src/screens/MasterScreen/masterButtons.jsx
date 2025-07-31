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
    const [threshold, setThreshold] = useState(85);
    const [sex, setSex] = useState("male");


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

    const handleSetThreshold = () => {
        console.log("set threshold", threshold, "over sex", sex);
        sendCommand("set_threshold", [selectedMachine], [], {
            sex: sex,
            threshold: threshold
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
                <div className={"expand-button"} style=
                    {{position: "relative", display: "flex", gap: "2px", flexDirection: "row", alignItems: "center"}}
                >
                    <div className={"master-button"}
                         onClick={() => sendCommand('reboot', [selectedMachine], [])}>Reboot
                    </div>
                    <div className={"master-button"} onClick={() => sendCommand('pull', [selectedMachine], [])}>Pull
                    </div>
                    {inSession && <div className={"master-button"}
                                       onClick={() => sendCommand('restart', [selectedMachine], [])}>Restart</div>}
                </div>

            }


            {!inSession && (
                <div className={"master-button"} onClick={handleStartSession}>Start sudo session</div>
            )}

            {inSession &&
                <>

                    <div className={"master-flow-ctl expand-button"}>
                        <div className={"master-header"}>
                            <h3>Flow Control:</h3>
                            <div className="master-button start" onClick={handleFlowControl}>
                                Start
                            </div>
                        </div>
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

                        <div className={"master-header"}>
                            <h3>Flow Check:</h3>
                            <div className="master-button start" onClick={handleFlowCheck}>
                                Start
                            </div>
                        </div>
                        <h4>Time (sec)</h4>
                        <input className="flow-time" type="number" value={flowTime} onChange={e =>
                            setFlowTime(parseFloat(e.target.value))}/>

                        <div className="master-button" onClick={handleCloseAllValves}>Close All Valves</div>

                    </div>

                    <div className="master-pressure-ctl expand-button">
                        <div className={"master-header"}>
                            <h3>Set Pressure:</h3>
                            <div className="master-button start" onClick={handleSetPressure}>
                                Start
                            </div>
                        </div>
                        <h4>Target pressure</h4>
                        <input className="target-pressure" type="number" value={targetPressure} onChange={e =>
                            setTargetPressure(parseFloat(e.target.value))}/>
                        <div className={"master-header"} style={{"gap": "5%", "left": "20%", position: "relative"}}>
                            <div className={"master-button"} onClick={() => sendCommand('on', [selectedMachine], [])}
                                 style={{width: "15%"}}
                            >On
                            </div>
                            <div className={"master-button"} onClick={() => sendCommand('off', [selectedMachine], [])}
                                 style={{width: "15%"}}

                            >Off
                            </div>
                        </div>
                    </div>


            {isSudoMode() ?
                <div className="master-button" onClick={handleLightSensorTest}>Light Sensors Test</div> : null}
                    {isSudoMode() ?
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
                        : null}
                    {isSudoMode() ?
                        <div className=" expand-button">
                            <div className={"master-header"}>
                                <h3>Set Sex Threshold:</h3>
                                <div className="master-button start" onClick={handleSetThreshold}>
                                    Set
                                </div>
                            </div>
                            <h4>Sex</h4>
                            <select className="flow-src" value={sex}
                                    onChange={e => setSex(e.target.value)}>
                                {["male", "female"].map(sex => (
                                    <option key={sex} value={sex}>{sex}</option>
                                ))}
                            </select>
                            <h4>Threshold</h4>
                            <input className="target-pressure" type="number" value={threshold}
                                   onChange={e =>
                                setThreshold(parseFloat(e.target.value))}/>
                            <h4> {`Current Threshold: ${liveData[selectedMachine].sex_thresholds}`}</h4>
                        </div>
                        : null}

                    {isSudoMode() ? <div className="master-button" onClick={handleExit}>Exit Session</div> : null}
                </>}
        </div>
    );
};