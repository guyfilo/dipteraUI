import React, {useContext, useEffect} from "react";
import {Button} from "../../components/Button";
import {Menu} from "../../components/Menu";
import {useState} from "react";
import "./style.css";
import {CommandButton} from "../../components/CommandButton/index.js";
import {PopupModal} from "../../components/popup-modal/PopupModal.jsx";
import {StartSession} from "../SessionSetup/StartSession.jsx";
import {DataContext} from "../../communication/DataContext.jsx";
import {SessionsHomeView} from "../SessionsHomeView/SessionsHomeView.jsx";
import {SessionInfoWindow} from "../SessionInfoWindow/SessionInfoWindow.jsx";
import {MachinesInfoWindow} from "../MachinesInfoWindow/MachinesInfoWindow.jsx";
import {
    SelectedMachinesProvider,
    SelectedMachinesContext
} from "../../components/SelectedMachinesContext/SelectedMachinesContext.jsx";
import {ScannerWindow} from "../ScannerWindow/ScannerWindow.jsx";
import {Lights} from "../../components/Lights/Lights.jsx";
import {MasterPage} from "../MasterScreen/MasterScreen.jsx";
import {Tagger} from "../Tagger/Tagger.jsx";

export const AppWindow = () => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const closePopUp = () => {
        setIsPopupOpen(false);
    }
    const {
        liveData,
        availableMachines,
        createSession,
        endSession,
        sendCommand,
        fetchAvailableMachines,
        taggerData,
        sessions,
    } = useContext(DataContext);

    const {
        selectedMachines,
        selectedSessions,
        stopRequest,
        setStopRequest,
        stopSessionRequest,
        setStopSessionRequest,
    } = useContext(SelectedMachinesContext);

    const [selected, setSelected] = useState("Home");

    let home_default =
        <div className={"home-default-container"}>
            <p style={{color: selected === "Scanner" ? "#fc4747" : null, display: "flex", position: "relative" , width: "max-content" }}>
                There are no {`${selected === "Scanner" ? "SCANNING " : ""}`}sessions running. Please start a new
                session
            </p>
            <Button
                className={"butten-instance-start-session"}
                ButtonClassName={selected === "Scanner" ? "butten-instance-start-scanner-session" : null}

                text={`Start A New ${selected === "Scanner" ? "SCANNER " : ""}Session`}
                onClick={() => setIsPopupOpen(true)}
            />
        </div>;

    const [homeBody, setHomeBody] = useState(home_default);
    useEffect(() => {
        if (Object.keys(sessions).length > 0) {
            if (selected === "Home") {
                setHomeBody(
                    <SessionsHomeView data={liveData} sessions={sessions}/>
                )
            } else if (selected === "Sessions") {
                setHomeBody(<SessionInfoWindow data={liveData} sessions={sessions}/>)
            } else if (selected === "Machines") {
                setHomeBody(<MachinesInfoWindow machines_data={liveData} sessions={sessions}></MachinesInfoWindow>)
            } else if (selected === "Scanner") {
                setHomeBody(<ScannerWindow data={liveData} sessions={sessions}></ScannerWindow>)
            }
        } else if (selected === "Treatments & Warnings") {
            setHomeBody(<div>Treatments & Warnings</div>)
        } else {
            setHomeBody(home_default)
        }
    }, [sessions, liveData, selected]);

    const renderHomeBody = () => {
        if (Object.keys(sessions).length > 0) {
            if (selected === "Home") {
                return <SessionsHomeView data={liveData} sessions={sessions}/>;
            } else if (selected === "Sessions") {
                return <SessionInfoWindow data={liveData} sessions={sessions}/>;
            } else if (selected === "Machines") {
                return <MachinesInfoWindow machines_data={liveData} sessions={sessions}/>;
            }
        }
        if (selected === "Scanner") {
            return <ScannerWindow data={liveData} sessions={sessions}
                                  newSessionCbk= {() => setIsPopupOpen(true)
                                  }
            />;
        }
        if (selected === "Master Mode") {
            return <MasterPage></MasterPage>
        }

        if (selected === "Tagger") {
            return <Tagger></Tagger>
        }

        if (selected === "Treatments & Warnings") {
            return <div>Treatments & Warnings</div>;
        }

        return home_default;
    };

    const handleStop = async () => {
        // Compute updated stop session list
        const newStopSessions = [...new Set([...stopSessionRequest, ...selectedSessions])];

        // Build a Set for fast lookup
        const sessionsToStopSet = new Set(newStopSessions);
        const stopRequestSet = new Set(stopRequest);

        // Filter machines that are not in a stopped session and not already in stopRequest
        const newMachines = selectedMachines.filter(machineId => {
            const sessionId = liveData[machineId]?.session_id;
            return !sessionsToStopSet.has(sessionId) && !stopRequestSet.has(machineId);
        });

        // Apply both state updates
        setStopSessionRequest(newStopSessions);
        setStopRequest(prev => [...prev, ...newMachines]);
    };


    return (
        <div className="start-window">
            <div className="div-2">
                <div className="home-body">
                    {renderHomeBody()}
                </div>
                <div className="group-2">

                    <div className="button-grid">
                        <CommandButton text="New Session" className="new-session-button-instance" id="new_session"
                                       onClick={() => setIsPopupOpen(true)}/>

                        <CommandButton text="Start" className="start-button" id="start"
                                       onClick={() => sendCommand(
                                           "run",
                                           selectedMachines,
                                           selectedSessions
                                       )}/>
                        <CommandButton text="Wash" className="wash-instance" id="wash"
                                       onClick={() => sendCommand(
                                           "wash",
                                           selectedMachines,
                                           selectedSessions
                                       )}/>

                        <CommandButton text="Pause" className="pause-button" id="pause"
                                       onClick={() => sendCommand(
                                           "pause",
                                           selectedMachines,
                                           selectedSessions
                                       )}/>

                        <CommandButton text="Sleep" className="sleep-button" id="sleep"
                                       onClick={() => sendCommand(
                                           "sleep",
                                           selectedMachines,
                                           selectedSessions
                                       )}/>
                        <CommandButton text="Stop" className="stop-button" id="stop"
                                       onClick={() => handleStop(
                                       )}/>
                    </div>
                </div>

                <div className="start-window-header">
                    <div className="prog_title">Session Manager</div>

                    <div className="diptera_header">Diptera.ai</div>

                    <img
                        className="diptera-ai-logo"
                        alt="Diptera ai logo"
                        src="/Diptera_logo.png"
                    />
                </div>

                <Menu className="menu-instance" divClassName="menu-2" setSelected={setSelected} selected={selected}/>
                <Lights liveData={liveData} sessions={sessions}></Lights>
            </div>
            <PopupModal isOpen={isPopupOpen} onClose={closePopUp}>
                <StartSession closeWindowCbk={closePopUp} scannerMode={selected === "Scanner"}></StartSession>
            </PopupModal>
        </div>
    );
};
