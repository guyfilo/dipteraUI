import React, {useContext, useEffect} from "react";

import { createContext, useState } from "react";
import {DataContext} from "../../communication/DataContext.jsx";

export const SelectedMachinesContext = createContext();

export const SelectedMachinesProvider = ({ children }) => {
    const [selectedMachines, setSelectedMachines] = useState([]);
    const [selectedSessions, setSelectedSessions] = useState([]);
    const {sessions, liveData} = useContext(DataContext);


    const selectMachine = (machine_id, state) => {
        setSelectedMachines(prev => {
            let updated = state
                ? [...new Set([...prev, machine_id])]
                : prev.filter(id => id !== machine_id);

            // Check session sync
            Object.entries(sessions).forEach(([sessionId, session_info]) => {
                const allSelected = session_info.machine_ids.every(m => updated.includes(m));
                const wasSelected = selectedSessions.includes(sessionId);

                if (allSelected && !wasSelected) {
                    setSelectedSessions(s => [...s, sessionId]);
                } else if (!allSelected && wasSelected) {
                    setSelectedSessions(s => s.filter(id => id !== sessionId));
                }
            });

            return updated;
        });
    };

    useEffect(() => {
        selectedSessions.forEach(sessionId => {
            if (!(sessionId in sessions)) {
                // Only call if needed
                removeSessionAndMachines(sessionId);
            }
        });
    }, [sessions]);

    const removeSessionAndMachines = (sessionId) => {
        setSelectedSessions(prev => prev.filter(id => id !== sessionId));

        setSelectedMachines(prev => {
            const machinesToRemove = Object.values(liveData)
                .filter(machine =>
                    machine.session_id === sessionId || machine.session_id == null
                )
                .map(machine => machine.machine_id);

            return prev.filter(machineId => !machinesToRemove.includes(machineId));
        });
    };

    const selectSession = (session_id, state) => {

        const machines = sessions[session_id].machine_ids || [];
        setSelectedSessions(prev => {
            if (state && !prev.includes(session_id)) {
                return [...prev, session_id];
            } else if (!state) {
                return prev.filter(id => id !== session_id);
            }
            return prev;
        });

        setSelectedMachines(prev => {
            if (state) {
                // Add all machines in session, avoiding duplicates
                return [...new Set([...prev, ...machines])];
            } else {
                // Remove all machines of this session
                return prev.filter(m => !machines.includes(m));
            }
        });
    };

    const selectAll = () => {
        const allSessionIds = Object.keys(sessions);
        const areAllSelected = selectedSessions.length === allSessionIds.length;

        if (areAllSelected) {
            setSelectedSessions([]);
            setSelectedMachines([]);
        } else {
            allSessionIds.forEach(sessionId => {
                selectSession(sessionId, true); // This will also select all related machines
            });
        }
    };


    return (
        <SelectedMachinesContext.Provider value={{
            selectedMachines,
            selectedSessions,
            selectMachine,
            selectSession,
            selectAll
        }}>
            {children}
        </SelectedMachinesContext.Provider>
    );}