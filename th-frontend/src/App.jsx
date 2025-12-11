import React from 'react';
import {useState, useEffect} from "react";
import RoomSelector from "./components/RoomSelector";
import DateSelector from "./components/DateSelector";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import {getAvailableDates} from "./api/history";
import "./components/style.css";

const ROOMS = {
    larva: "octophi-larva",
    adult_left: "octophi-adult-left",
    adult_right: "octophi-adult-right",
};
import "./style.css";

export default function App() {
    const [room, setRoom] = useState("larva");
    const [dates, setDates] = useState([]);           // union of all dates
    const [date, setDate] = useState(null);           // selected date
    const [roomDates, setRoomDates] = useState({});   // room → its date list

    useEffect(() => {
        async function loadAllDates() {
            const entries = await Promise.all(
                Object.keys(ROOMS).map(r => getAvailableDates(r))
            );

            // Build room → dates map
            const roomToDates = {};
            Object.keys(ROOMS).forEach((roomName, idx) => {
                roomToDates[roomName] = entries[idx].dates;
            });

            setRoomDates(roomToDates);
            // Compute union of all dates
            const union = Array.from(
                new Set(entries.flatMap(e => e.dates))
            ).sort();   // sorted chronologically

            setDates(union);

            // Auto-select the latest date
            if (union.length > 0) {
                setDate(union[union.length - 1]);
            }
        }

        loadAllDates();
    }, []);   // run once, not per room
    const availableRooms = Object.keys(ROOMS).filter(r =>
        roomDates[r]?.includes(date)
    );
    return (
        <div className={"th-container"}>
            <h1>Diptera TH Logger Dashboard</h1>
            <img alt={"diptera_logo"} src={"/diptera_logo.svg"} className={"logo"}></img>

            <div className={"body"}>
                <Dashboard/>
                <div className="chart-card" >
                    <DateSelector dates={dates} value={date} onChange={setDate}/>

                    <History rooms={availableRooms} date={date}/>
                </div>
            </div>

        </div>
    );
}