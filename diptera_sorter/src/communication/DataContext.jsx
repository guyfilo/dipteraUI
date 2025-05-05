import React, { createContext, useState, useEffect, useRef } from "react";

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const [data, setData] = useState({});
    const [availableMachines, setAvailableMachines] = useState([]);
    const socketRef = useRef(null);

    const [sessions, setSessions] = useState({});
    const [connected, setConnected] = useState(false);


    const fetchFullState = async () => {
        const res = await fetch("http://localhost:8000/api/state/full");
        const json = await res.json();
        setData(json.machines);
        setSessions(json.sessions);
    };

    let fetchInterval = null; // Outside the function so you can clear it later

    const connectWebSocket = () => {
        const socket = new WebSocket("ws://localhost:8000/ws"); // Should be ws:// not http://
        socketRef.current = socket;

        socket.onopen = async () => {
            console.log("✅ WebSocket connected");
            setConnected(true);

            // Immediately fetch full state once
            try {
                await fetchFullState();
            } catch (err) {
                console.error("❌ Failed to fetch full state:", err);
            }

            // Then set interval to fetch every 10 seconds
            fetchInterval = setInterval(async () => {
                try {
                    await fetchFullState();
                } catch (err) {
                    console.error("❌ Failed to fetch full state (periodic):", err);
                }
            }, 10000); // 10,000ms = 10 seconds
        };

        socket.onmessage = (event) => {
            const update = JSON.parse(event.data);
            setData(prev => ({ ...prev, [update.machine_id]: update }));
        };

        socket.onerror = (err) => {
            console.warn("⚠️ WebSocket error:", err);
            socket.close(); // Triggers onclose
        };

        socket.onclose = () => {
            console.warn("🔌 WebSocket closed, retrying in 2s...");
            setConnected(false);

            // Stop the periodic fetching
            if (fetchInterval) {
                clearInterval(fetchInterval);
                fetchInterval = null;
            }

            setTimeout(connectWebSocket, 2000); // Reconnect after 2s
        };
    };


    useEffect(() => {
        connectWebSocket("ws://localhost:8000/ws");
        return () => socketRef.current?.close();
    }, []);

    // REST API calls (same as before)...
    const createSession = async (sessionData) => {
        console.log("sessionData:", JSON.stringify(sessionData, null, 2));
        const res = await fetch("http://localhost:8000/api/session/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sessionData),
        });

        const data = await res.json();

        if (!res.ok) {
            console.error("Failed to create session:", data);
            throw new Error("Session creation failed");
        }
        console.log("sessionData:", JSON.stringify(data, null, 2));


        setSessions(prev => ({ ...prev, [sessionData.session_id]: sessionData }));
        return data;
    };

    const endSession = async (session_id) => {
        const res = await fetch("http://localhost:8000/api/session/end", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session_id }),
        });
        return res.json();
    };

    const removeMachine = async (session_id, machine_id) => {
        const res = await fetch("http://localhost:8000/api/session/remove_machine", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session_id: session_id, machine_id: machine_id }),
        });
        return res.json();
    };

    const restart_machines = async (machines) => {
        const res = await fetch("http://localhost:8000/api/machines/restart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ machines: machines}),
        });
        return res.json();
    };

    const sendCommand = async (command, machines, sessions) => {
        console.log(machines);
        const res = await fetch("http://localhost:8000/api/command", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ command, machines , sessions}),
        });
        return res.json();
    };

    const fetchAvailableMachines = async () => {
        const res = await fetch("http://localhost:8000/api/machines/available");
        const json = await res.json();
        setAvailableMachines(json.available_machines || []);
        return json;
    };

    useEffect(() => {
        fetchAvailableMachines();
    }, []);

    return (
        <DataContext.Provider value={{
            liveData: data,
            availableMachines,
            createSession,
            endSession,
            sendCommand,
            fetchAvailableMachines,
            sessions,
            restart_machines,
            removeMachine
        }}>
            {children}
        </DataContext.Provider>
    );
};
