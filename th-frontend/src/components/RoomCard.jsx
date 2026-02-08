import React from 'react';
import './style.css';
import {ROOM_COLORS} from './ChartCard.jsx';



export default function RoomCard({ data, room }) {
    const METRICS = room === "temp"
        ? Array.from({ length: 8 }, (_, i) => ({
            key: `sensor${i + 1}`,
            label: `Sensor ${i + 1}`,
            idx: i,
            unit: "°C"
        }))
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
        },
        MahaneYehuda: {
            temp: { min: 25, max: 30 },
            humid: { min: 55, max: 80 }
        }
    };
    BOUNDARIES.temp = Object.fromEntries(
        Array.from({ length: 8 }, (_, i) => [
            `sensor${i + 1}`,
            { min: 27, max: 35 }
        ])
    );
    function isOutOfBounds(room, type, value) {
        const rule = BOUNDARIES[room]?.[type];
        if (!rule) return false; // no rule for this metric

        return value < rule.min || value > rule.max;
    }
    const [lastUpdateTs, setLastUpdateTs] = React.useState(null);
    const [secondsAgo, setSecondsAgo] = React.useState(null);
    const roomName = (room !== "MahaneYehuda") ? room : "mahane_yehuda";

    function tempToColor(value, min = 25, max = 35) {
        if (value == null || isNaN(value)) return "#999";

        // clamp
        const t = Math.min(1, Math.max(0, (value - min) / (max - min)));

        // blue → cyan → green → yellow → red
        const hue = (1 - (t ** 0.5)) * 240 ; // 240=blue, 0=red
        return `hsl(${hue}, 85%, 55%)`;
    }

    React.useEffect(() => {
        if (!data) return;

        // 🌡️ TEMP ROOM — structured sensors dict
        if (room === "temp") {
            if (!data.sensors) return;

            const values = {};
            let latestTs = null;

            Object.entries(data.sensors).forEach(([key, sensor]) => {
                const idx = key.replace("sensor_", "");
                const metricKey = `sensor${idx}`;

                const latest = sensor.latest;
                if (!latest) return;

                values[metricKey] = latest.temperature_c.toFixed(1);

                const ts = new Date(latest.timestamp);
                if (!latestTs || ts > latestTs) {
                    latestTs = ts;
                }
            });

            setAvgValues(values);
            setLastUpdateTs(latestTs);
            return;
        }

        // 💧 NON-TEMP ROOMS — legacy CSV parsing
        if (!data.latest_logs) return;

        const parsed = data.latest_logs.map(line => {
            const parts = line.split(",");
            const row = { ts: new Date(parts[0]) };

            METRICS.forEach(m => {
                row[m.key] = parseFloat(parts[m.idx]);
            });

            return row;
        });

        if (!parsed.length) return;

        const slice = parsed.slice(-10);
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
    }, [data, room]);


    React.useEffect(() => {
        if (!lastUpdateTs) return;

        const interval = setInterval(() => {
            const diffSec = Math.floor((Date.now() - lastUpdateTs) / 1000);
            setSecondsAgo(diffSec);
        }, 1000);

        return () => clearInterval(interval);
    }, [lastUpdateTs]);
    const color = ROOM_COLORS[room];

    if (!data) return (    <div className={`room-card loading-card`}>
        <h1 style={{color}}>{roomName.replace("_", " ").toUpperCase()}</h1>
        <h2 >Loading...</h2>
    </div>);
    if (data.error) return (    <div className={`room-card warning-card`}>
        <h1 style={{color}}>{roomName.replace("_", " ").toUpperCase()}</h1>
        <h2 className={"warning"}>{data.error}</h2>
    </div>)
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

            <h1 style={{color}}>{roomName.replace("_", " ").toUpperCase()}</h1>
            <div className="data-wrapper">
                {METRICS.map(m => {
                    const value = avgValues[m.key];
                    const num = value != null ? Number(value) : null;

                    const out =
                        num !== null &&
                        isOutOfBounds(room, m.key, num);

                    const heatColor =
                        room === "temp" && num !== null
                            ? tempToColor(num)
                            : undefined;

                    return (
                        <div
                            key={m.key}
                            className={`room-val ${out ? "warning" : ""}`}
                        >
                            <span className="label">{m.label}</span>

                            <div className="value-row">
                                <h2
                                    style={heatColor ? { color: heatColor } : {}}
                                >
                                    {value ?? "—"}
                                </h2>
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
