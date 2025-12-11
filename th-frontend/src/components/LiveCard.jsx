import React from 'react';
import ROOM_COLORS from './ChartCard.jsx';
export default function LiveCard({ data }) {
    const TEMP_IDX = 2;
    const HUM_IDX = 3;

    const [avgTemp, setAvgTemp] = React.useState(null);
    const [avgHum, setAvgHum] = React.useState(null);
    const [lastUpdateTs, setLastUpdateTs] = React.useState(null);
    const [secondsAgo, setSecondsAgo] = React.useState(null);

    React.useEffect(() => {
        if (!data || !data.latest_logs || !Array.isArray(data.latest_logs)) return;

        const logs = data.latest_logs;

        // parse logs: "timestamp,temp,hum"
        const parsed = logs.map(line => {
            const parts = line.split(",");
            return {
                ts: new Date(parts[0]),
                temp: parseFloat(parts[TEMP_IDX]),
                hum: parseFloat(parts[HUM_IDX])
            };
        });

        if (parsed.length === 0) return;

        // compute rolling averages over last N entries
        const N = 10;
        const slice = parsed.slice(-N);

        const avgT = slice.reduce((s, x) => s + x.temp, 0) / slice.length;
        const avgH = slice.reduce((s, x) => s + x.hum, 0) / slice.length;

        setAvgTemp(avgT.toFixed(2));
        setAvgHum(avgH.toFixed(2));

        // compute "time since last update"
        const lastTs = parsed[parsed.length - 1].ts;

        setLastUpdateTs(lastTs);
    }, [data]);

    React.useEffect(() => {
        if (!lastUpdateTs) return;

        const interval = setInterval(() => {
            const now = new Date();
            const diffSec = Math.floor((now - lastUpdateTs) / 1000);
            setSecondsAgo(diffSec);
        }, 1000);

        return () => clearInterval(interval);
    }, [lastUpdateTs]);

    if (!data) return <div>Loading...</div>;
    if (data.error) return <div>🚨 Pi Offline</div>;

    return (
        <div className="card">
            <h3>Live Status</h3>

            <p>CPU Temp: {data.cpu_temp}°C</p>
            <p>Logger Running: {data.logger_running ? "Yes" : "No"}</p>
            <p>Boot: {data.boot_ts}</p>
            <p>Memory: {data.memory.percent.toFixed(1)}%</p>
            <p>Disk: {data.disk.percent.toFixed(1)}%</p>

            <hr />

            <p><strong>Temp avg:</strong> {avgTemp ? `${avgTemp}°C` : "—"}</p>
            <p><strong>Humidity avg:</strong> {avgHum ? `${avgHum}%` : "—"}</p>
            <p>
                <strong>Last update:</strong>
                {secondsAgo !== null ? `${secondsAgo}s ago` : "—"}
            </p>
        </div>
    );
}
