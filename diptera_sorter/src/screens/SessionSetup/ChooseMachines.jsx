import React, {useContext} from "react";
import "./style.css";
import {useState, useEffect} from "react";
import {NewSessionForm} from "./NewSessionForm.jsx";
import {DataContext} from "../../communication/DataContext.jsx";
import {Checkbox} from "../../components/Checkbox/index.jsx";
import {Button} from "../../components/Button/index.js";


export const ChooseMachines = ({setSessionInfo, onNext, sessionInfo}) => {
    const [selectedMachines, setSelectedMachines] = useState([]);
    const {
        liveData,
        availableMachines,
        createSession,
        endSession,
        sendCommand,
        fetchAvailableMachines,
        sessions,
    } = useContext(DataContext);

    useEffect(() => {
        fetchAvailableMachines();                      // first shot
        const id = setInterval(fetchAvailableMachines, 10_000); // poll every 5 s
        return () => clearInterval(id);               // cleanup when user leaves “choose”
    }, []);

    const setMachines = async () => {
        if (selectedMachines.length === 0) return;
        onNext();
        const updatedSession = {
            ...sessionInfo,
            machine_ids: selectedMachines,
        };

        setSessionInfo(updatedSession); // keep for state updates

        await createSession(updatedSession); // use the updated object
    };


    return (
        <div>
            <div className="choose-machines-window">
                <div className={"choose-all-machines-new-session"}>
                    <Checkbox text={"Choose All Available Machines"}
                              boolVar={
                                  selectedMachines.length > 0 &&
                                  selectedMachines.length === availableMachines.length
                              }
                              setBoolVar={(checked) => {
                                  setSelectedMachines(checked ? availableMachines : []);
                              }}
                    ></Checkbox>
                </div>
                <div className={"optional-machines-new-session"}>
                    {availableMachines.map((machine) => (
                        <div className={"machine-option-line"}>
                            <Checkbox text={`Machine ${machine}`}
                                      id={machine}
                                      boolVar={selectedMachines.includes(machine)}
                                      setBoolVar={(checked) => {
                                          setSelectedMachines((prev) =>
                                              checked
                                                  ? [...prev, machine]                      // Add to list
                                                  : prev.filter((m) => m !== machine)       // Remove from list
                                          );
                                      }}
                            ></Checkbox>
                        </div>
                    ))}
                </div>

            </div>
            <Button className={"next-step-button"} text={"Next Step"} onClick={setMachines} once={false}></Button>

        </div>
    );

}
