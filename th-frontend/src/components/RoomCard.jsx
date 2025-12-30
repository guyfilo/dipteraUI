import React from 'react';
import './style.css';
import {ROOM_COLORS} from './ChartCard.jsx';

export default function RoomCard({ data, room }) {
    const METRICS = room === "temp"
        ? [
            { key: "temp1", label: "Temp1", idx: 0, unit: "°C" },
            { key: "temp2", label: "Temp2", idx: 1, unit: "°C" }
        ]
        : [
            { key: "temp",  label: "Temp",  idx: 2, unit: "°C" },
            { key: "humid", label: "Humid", idx: 3, unit: "%"  }
        ];
    const [avgValues, setAvgValues] = React.useState({});

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
    BOUNDARIES.temp = {
        temp1: { min: 20, max: 35 },
        temp2: { min: 20, max: 35 }
    };
    function isOutOfBounds(room, type, value) {
        const rule = BOUNDARIES[room]?.[type];
        if (!rule) return false; // no rule for this metric

        return value < rule.min || value > rule.max;
    }

    const [lastUpdateTs, setLastUpdateTs] = React.useState(null);
    const [secondsAgo, setSecondsAgo] = React.useState(null);

    React.useEffect(() => {
        if (!data || !data.latest_logs) return;

        const parsed = data.latest_logs.map(line => {
            const parts = line.split(",");
            const row = {}
            if (room === "temp") {
                const dateStr =
                    (parts[2] + "," + parts[3])
                        .replace(/"/g, "")
                        .trim();

                row.ts = new Date(dateStr);
            } else {
                row.ts = new Date(parts[0]);
            }


            METRICS.forEach(m => {
                row[m.key] = parseFloat(parts[m.idx]);
            });

            return row;
        });

        if (parsed.length === 0) return;

        const N = 10;
        const slice = parsed.slice(-N);

        const avgs = {};
        METRICS.forEach(m => {
            avgs[m.key] =
                slice.reduce((s, x) => s + x[m.key], 0) / slice.length;
        });

        setLastUpdateTs(parsed.at(-1).ts);
        setAvgValues(
            Object.fromEntries(
                Object.entries(avgs).map(([k, v]) => [k, v.toFixed(1)])
            )
        );
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
    const metricOut = {};
    METRICS.forEach(m => {
        const v = avgValues[m.key];
        metricOut[m.key] =
            v !== undefined &&
            isOutOfBounds(room, m.key, Number(v));
    });
    const warning = Object.values(metricOut).some(Boolean);

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
                {METRICS.map(m => {
                    const value = avgValues[m.key];
                    const out = value !== undefined &&
                        isOutOfBounds(room, m.key === "humid" ? "humid" : "temp", Number(value));

                    return (
                        <div key={m.key} className={`room-val ${out ? "warning" : ""}`}>
                            <span className="label">{m.label}</span>
                            <div className="value-row">
                                <h2>{value ?? "—"}</h2>
                                <p>{value ? m.unit : "—"}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
            <p className={"update-dt"}>
                <strong>Last update:</strong> {secondsAgo !== null ? `${secondsAgo}s ago` : "—"}
            </p>
        </div>
    );
}
