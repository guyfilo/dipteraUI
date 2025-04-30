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
        sessions,
    } = useContext(DataContext);

    const {
        selectedMachines,
        selectedSessions
    } = useContext(SelectedMachinesContext);

    const [selected, setSelected] = useState("Home");

    const home_default = <>
        <Button
            className="butten-instance-start-session"
            text="Start A New Session"
            onClick={() => setIsPopupOpen(true)}
        />
        <p className="no-session-msg">
            There are no sessions running. Please start a new session
        </p>
    </>;

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
                setHomeBody(<MachinesInfoWindow data={liveData} sessions={sessions}></MachinesInfoWindow>)
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
                return <MachinesInfoWindow data={liveData} sessions={sessions}/>;
            }
        }

        if (selected === "Treatments & Warnings") {
            return <div>Treatments & Warnings</div>;
        }

        return home_default;
    };


    return (
        <div className="start-window">
            <div className="div-2">
                <div className="home-body">
                    {renderHomeBody()}
                </div>
                <div className="group-2">
                    <div className="text-wrapper-7">Actions</div>

                    <div className="button-grid">
                        <CommandButton text="New Session" className="new-session-button-instance" id="new_session"
                                       onClick={() => setIsPopupOpen(true)}/>
                        <CommandButton text="Pause" className="pause-button" id="pause"
                                       onClick={() => sendCommand(
                                           "pause",
                                           selectedMachines,
                                           selectedSessions
                                       )}/>
                        <CommandButton text="Start" className="start-button" id="start"
                                       onClick={() => sendCommand(
                                           "run",
                                           selectedMachines,
                                           selectedSessions
                                       )}/>
                        <CommandButton text="Stop" className="stop-button" id="stop"
                                       onClick={() => sendCommand(
                                           "stop",
                                           selectedMachines,
                                           selectedSessions
                                       )}/>
                        <CommandButton text="Wash" className="wash-instance" id="wash"
                                       onClick={() => sendCommand(
                                           "wash",
                                           selectedMachines,
                                           selectedSessions
                                       )}/>
                    </div>
                </div>

                <div className="start-window-header">
                    <div className="prog_title">Program Tittle</div>

                    <div className="diptera_header">Diptera.ai</div>

                    <img
                        className="diptera-ai-logo"
                        alt="Diptera ai logo"
                        src="/Diptera_logo.png"
                    />
                </div>

                <Menu className="menu-instance" divClassName="menu-2" setSelected={setSelected} selected={selected}/>
            </div>
            <PopupModal isOpen={isPopupOpen} onClose={closePopUp}>
                <StartSession closeWindowCbk={closePopUp}></StartSession>
            </PopupModal>
        </div>
    );
};
