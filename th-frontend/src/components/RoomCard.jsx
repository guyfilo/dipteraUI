import React from 'react';
import './style.css';
import {ROOM_COLORS} from './ChartCard.jsx';

export default function RoomCard({ data, room }) {
    const TEMP_IDX = 2;
    const HUM_IDX = 3;
    const BOUNDARIES = {
        larva: {
            temp: { min: 29, max: Infinity },   // temp >= 29
            humid: null                         // no rule
        },
        adult_left: {
            temp: { min: 25, max: 30 },
            humid: { min: 55, max: 80 }
        },
        adult_right: {
            temp: { min: 25, max: 30 },
            humid: { min: 55, max: 80 }
        }
    };
    function isOutOfBounds(room, type, value) {
        const rule = BOUNDARIES[room]?.[type];
        if (!rule) return false; // no rule for this metric

        return value < rule.min || value > rule.max;
    }

    const [avgTemp, setAvgTemp] = React.useState(null);
    const [avgHum, setAvgHum] = React.useState(null);
    const [lastUpdateTs, setLastUpdateTs] = React.useState(null);
    const [secondsAgo, setSecondsAgo] = React.useState(null);

    React.useEffect(() => {
        if (!data || !data.latest_logs) return;

        const parsed = data.latest_logs.map(line => {
            const parts = line.split(",");
            return {
                ts: new Date(parts[0]),
                temp: parseFloat(parts[TEMP_IDX]),
                hum: parseFloat(parts[HUM_IDX])
            };
        });

        if (parsed.length === 0) return;

        const N = 10;
        const slice = parsed.slice(-N);

        const avgT = slice.reduce((s, x) => s + x.temp, 0) / slice.length;
        const avgH = slice.reduce((s, x) => s + x.hum, 0) / slice.length;

        setAvgTemp(avgT.toFixed(2));
        setAvgHum(avgH.toFixed(2));
        setLastUpdateTs(parsed.at(-1).ts);
    }, [data]);

    React.useEffect(() => {
        if (!lastUpdateTs) return;

        const interval = setInterval(() => {
            const diffSec = Math.floor((Date.now() - lastUpdateTs) / 1000);
            setSecondsAgo(diffSec);
        }, 1000);

        return () => clearInterval(interval);
    }, [lastUpdateTs]);

    if (!data) return <div>Loading...</div>;
    if (data.error) return <div>🚨 Pi Offline</div>;
    const color = ROOM_COLORS[room];
    console.log(ROOM_COLORS);
    const tempOut = avgTemp !== null && isOutOfBounds(room, "temp", Number(avgTemp));
    const humOut  = avgHum  !== null && isOutOfBounds(room, "humid", Number(avgHum));
    const warning = tempOut || humOut;
    return (
        <div className={`room-card ${warning? 'warning-card': ''}`}>
            {/* Info icon with hover popup */}
            <div className="info-wrapper">
                <div className="info-icon">ℹ️</div>
                <div className="info-popup">
                    <p><strong>CPU Temp:</strong> {data.cpu_temp}°C</p>
                    <p><strong>Logger Running:</strong> {data.logger_running ? "Yes" : "No"}</p>
                    <p><strong>Boot:</strong> {data.boot_ts}</p>
                    <p><strong>Memory:</strong> {data.memory.percent.toFixed(1)}%</p>
                    <p><strong>Disk:</strong> {data.disk.percent.toFixed(1)}%</p>
                </div>
            </div>

            <h1 style={{color}}>{room.replace("_", " ").toUpperCase()}</h1>
            <div className="data-wrapper">
                <div className={`room-val ${tempOut ? "warning" : ""}`}>
                    <span className="label">temp</span>
                    <div className="value-row">
                        <h2>{avgTemp}</h2>
                        <p>{avgTemp ? `°C` : "—"}</p>
                    </div>
                </div>
                <div className={`room-val ${humOut ? "warning" : ""}`}>
                    <span className="label">humid</span>
                    <div className="value-row">
                        <h2>{avgHum}</h2>
                        <p>{avgTemp ? `%` : "—"}</p>
                    </div>
                </div>
            </div>
            <p className={"update-dt"}>
                <strong>Last update:</strong> {secondsAgo !== null ? `${secondsAgo}s ago` : "—"}
            </p>
        </div>
    );
}
