import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const ROOM_COLORS = {
    "larva": "#ee00ff",
    "adult_left": "#b700ff",
    "adult_right": "rgb(97,0,208)"
};


export default function ChartCard({ data, selectedRooms , date}) {
    if (!data) return <div>Loading...</div>;

    // day is an array: [{room, timestamps, temp[], humid[]}, ...]
    const timestamps = data[0].timestamps;

    // Prepare data rows
    const chartData = timestamps.map((ts, i) => {
        const row = { ts };

        for (const dataset of data) {
            row[dataset.room + "_temp"] = dataset.temp[i];
            row[dataset.room + "_humid"] = dataset.humid[i];
        }
        return row;
    });

    return (
        <div style={{ padding: "20px" }}>
            <h4>Temperature - {date}</h4>
            <LineChart width={1000}  height={250} data={chartData} syncId="history">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="ts"
                    fontSize={"10px"}
                    tickFormatter={(ts) => new Date(ts).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false

                    })}
                />
                <YAxis />
                <Tooltip
                    labelFormatter={(ts) =>
                        new Date(ts).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit"
                        })
                    }
                />

                {data.map(dataset => (
                    <Line
                        key={dataset.room + "_temp"}
                        type="monotone"
                        dataKey={dataset.room + "_temp"}
                        stroke={ROOM_COLORS[dataset.room]}
                        dot={false}
                    />
                ))}

            </LineChart>

            <h4>Humidity - {date}</h4>
            <LineChart width={1000} height={250} data={chartData} syncId="history">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="ts"
                    fontSize={"10px"}
                    tickFormatter={(ts) => new Date(ts).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false

                    })}
                />
                <YAxis />
                <Tooltip
                    labelFormatter={(ts) =>
                        new Date(ts).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit"
                        })
                    }
                />

                {data.map(dataset => (
                    <Line
                        key={dataset.room + "_humid"}
                        type="monotone"
                        dataKey={dataset.room + "_humid"}
                        stroke={ROOM_COLORS[dataset.room]}
                        dot={false}
                    />
                ))}

            </LineChart>
        </div>
    );
}
