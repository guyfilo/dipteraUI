import React, { createContext, useState, useEffect, useRef } from "react";

const SERVERS = {
    israel: {
        name: "Israel Site",
        API_BASE: "http://dipt-net.tailb282fd.ts.net:8000",
        WS_BASE: "ws://dipt-net.tailb282fd.ts.net:8000"
    },
    burkina: {
        name: "Burkina Site",
        API_BASE: "http://sorter-burkina.tailb282fd.ts.net:8000",
        WS_BASE: "ws://sorter-burkina.tailb282fd.ts.net:8000"
    }
};

export const DataContext = createContext();

const getServerKey = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const key = urlParams.get("site");
    return key === "burkina" ? "burkina" : "israel";
};

export const DataProvider = ({ children }) => {
    const serverKey = getServerKey();
    const server = SERVERS[serverKey];
    const { API_BASE, WS_BASE } = server;

    const [data, setData] = useState({});
    const [taggerData, setTaggerData] = useState({});
    const [availableMachines, setAvailableMachines] = useState([]);
    const [sessions, setSessions] = useState({});
    const [connected, setConnected] = useState(false);
    const socketRef = useRef(null);

    const fetchFullState = async () => {
        const res = await fetch(`${API_BASE}/api/state/full`);
        const json = await res.json();
        setData(json.machines);
        setSessions(json.sessions);
    };

    let fetchInterval = null;

    const connectWebSocket = () => {
        const socket = new WebSocket(`${WS_BASE}/ws`);
        socketRef.current = socket;

        socket.onopen = async () => {
            console.log(`✅ WebSocket connected to ${WS_BASE}`);
            setConnected(true);

            try {
                await fetchFullState();
            } catch (err) {
                console.error("❌ Failed to fetch full state:", err);
            }

            fetchInterval = setInterval(async () => {
                try {
                    await fetchFullState();
                } catch (err) {
                    console.error("❌ Periodic state fetch failed:", err);
                }
            }, 10000);
        };

        socket.onmessage = (event) => {
            const update = JSON.parse(event.data);
            if (update?.machine_id === "tagger") {
                if (update.remove) {
                    setTaggerData(null);
                    return;
                }
                setTaggerData(update);
                return;
            }
            setData(prev => ({ ...prev, [update.machine_id]: update }));
        };

        socket.onerror = (err) => {
            console.warn("⚠️ WebSocket error:", err);
            socket.close();
        };

        socket.onclose = () => {
            console.warn("🔌 WebSocket closed, retrying...");
            setConnected(false);
            if (fetchInterval) {
                clearInterval(fetchInterval);
                fetchInterval = null;
            }
            setTimeout(connectWebSocket, 2000);
        };
    };

    useEffect(() => {
        connectWebSocket();
        return () => socketRef.current?.close();
    }, [serverKey]);

    const createSession = async (sessionData) => {
        const res = await fetch(`${API_BASE}/api/session/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sessionData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error("Session creation failed");
        setSessions(prev => ({ ...prev, [sessionData.session_id]: sessionData }));
        return data;
    };

    const endSession = async (session_id) => {
        const res = await fetch(`${API_BASE}/api/session/end`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session_id }),
        });
        return res.json();
    };

    const removeMachine = async (session_id, machine_id) => {
        const res = await fetch(`${API_BASE}/api/session/remove_machine`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session_id, machine_id }),
        });
        return res.json();
    };

    const restart_machines = async (machines) => {
        const res = await fetch(`${API_BASE}/api/machines/restart`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ machines }),
        });
        return res.json();
    };

    const sendCommand = async (command, machines, sessions, kwargs = {}) => {
        const res = await fetch(`${API_BASE}/api/command`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ command, machines, sessions, kwargs }),
        });
        return res.json();
    };

    const fetchAvailableMachines = async () => {
        const res = await fetch(`${API_BASE}/api/machines/available`);
        const json = await res.json();
        setAvailableMachines(json.available_machines || []);
        return json;
    };

    useEffect(() => {
        fetchAvailableMachines();
    }, [serverKey]);

    return (
        <DataContext.Provider value={{
            liveData: data,
            taggerData,
            availableMachines,
            createSession,
            endSession,
            sendCommand,
            fetchAvailableMachines,
            sessions,
            restart_machines,
            removeMachine,
            serverName: server.name
        }}>
            {children}
        </DataContext.Provider>
    );
};
