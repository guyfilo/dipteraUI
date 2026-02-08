import React from "react";
import { useLiveData } from "../hooks/useLiveData";
import RoomCard from "../components/RoomCard";
import "./style.css";

function TempDashboard() {
    const data = useLiveData("temp", "temp-reader");
    console.log(data);
    return (
        <div className="rooms-grid single">
            <RoomCard room="temp" data={data} />
        </div>
    );
}

const ROOMS = {
    larva: "octophi-larva",
    adult_left: "octophi-adult-left",
    adult_right: "octophi-adult-right",
    MahaneYehuda: "octophi-mahane",
};

function HumidDashboard() {
    return (
        <div className="rooms-grid">
            {Object.entries(ROOMS).map(([room, ip]) => {
                const data = useLiveData(room, ip);
                return (
                    <RoomCard
                        key={room}
                        room={room}
                        data={data}
                    />
                );
            })}
        </div>
    );
}

export default function Dashboard({ tab }) {
    return tab === "temp"
        ? <TempDashboard />
        : <HumidDashboard />;
}
