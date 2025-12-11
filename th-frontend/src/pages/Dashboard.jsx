import React from 'react';
import { useLiveData } from "../hooks/useLiveData";
import RoomCard from "../components/RoomCard.jsx";
import "./style.css";   // we will add a grid style

export default function Dashboard() {

    const ROOMS = {
        larva: "octophi-larva",
        adult_left: "octophi-adult-left",
        adult_right: "octophi-adult-right",
    };

    return (
        <div>

            <div className="rooms-grid">
                {Object.entries(ROOMS).map(([roomName,ip ]) => {
                    const data = useLiveData(roomName, ip);
                    return (
                        <RoomCard
                            data={data}
                            room={roomName}
                        />
                    );
                })}
            </div>
        </div>
    );
}