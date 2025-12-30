import React from 'react';
import {useState} from 'react';
import {LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Brush, ReferenceArea} from "recharts";

export const ROOM_COLORS = {
    "larva": "#bd4010",
    "adult_left": "#078209",
    "adult_right": "rgb(97,0,208)",
    "temp": "#17518f"
};
function computeDomain(values, padding = 2) {
    if (!values.length) return ["auto", "auto"];
    const min = Math.min(...values);
    const max = Math.max(...values);
    return [min - padding, max + padding];
}
function downloadCSV(rows, filename) {
    if (!rows || !rows.length) return;

    const header = Object.keys(rows[0]).join(",");

    const body = rows
        .map(row =>
            Object.values(row)
                .map(v => {
                    // format timestamps
                    if (typeof v === "number" && v > 1e12) {
                        return `"${new Date(v).toISOString()}"`;
                    }
                    return `"${v}"`;
                })
                .join(",")
        )
        .join("\n");

    const csv = header + "\n" + body;

    const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = filename;
    a.style.display = "none";

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}



export default function ChartCard({
                                      data,
                                      selectedRooms,
                                      fromdate,
                                      todate
                                  }) {
    if (!data) return <div>Loading...</div>;

    // day is an array: [{room, timestamps, temp[], humid[]}, ...]
    console.log(data);
    const timestamps = data[0].timestamps;

    // Prepare data rows
    const chartData = timestamps.map((ts, i) => {
        const row = { ts: new Date(ts).getTime() }; // ← THIS

        for (const dataset of data) {
            row[dataset.room + "_temp"] = dataset.temp[i];
            row[dataset.room + "_humid"] = dataset.humid[i];
        }
        return row;
    });


    /* ---------- visibility state ---------- */

    const [hiddenRooms, setHiddenRooms] = React.useState({});

    const toggleRoom = (room) => {
        setHiddenRooms(h => ({
            ...h,
            [room]: !h[room]
        }));
    };

    const [zoom, setZoom] = useState({
        left: "dataMin",
        right: "dataMax",
        refLeft: null,
        refRight: null
    });

    const onMouseDown = (e) => {
        if (!e?.activeLabel) return;
        setZoom(z => ({ ...z, refLeft: e.activeLabel }));
    };

    const onDoubleClick = (e) => {
        setZoom({
            left: "dataMin",
            right: "dataMax",
            refLeft: null,
            refRight: null
        });
    };

    const onMouseMove = (e) => {
        if (!zoom.refLeft || !e?.activeLabel) return;
        setZoom(z => ({ ...z, refRight: e.activeLabel }));
    };

    const onMouseUp = () => {
        if (!zoom.refLeft || !zoom.refRight) {
            setZoom(z => ({ ...z, refLeft: null, refRight: null }));
            return;
        }

        let [left, right] = [zoom.refLeft, zoom.refRight];
        if (left > right) [left, right] = [right, left];

        setZoom({
            left,
            right,
            refLeft: null,
            refRight: null
        });
    };



    /* ---------- domains ---------- */

    const tempValues = chartData.flatMap(row =>
        selectedRooms
            .map(r => row[`${r}_temp`])
            .filter(v => v != null)
    );

    const humidValues = chartData.flatMap(row =>
        selectedRooms
            .map(r => row[`${r}_humid`])
            .filter(v => v != null)
    );

    const tempDomain = computeDomain(tempValues, 2);
    const humidDomain = computeDomain(humidValues, 5);

    /* ---------- UI ---------- */

    return (
        <div style={{ padding: 20, userSelect: "none" }}>

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <h4>
                    Temperature {fromdate} → {todate}
                </h4>

                <button
                    onClick={() =>
                        downloadCSV(
                            chartData,
                            `${fromdate}__${todate}__th_data.csv`
                        )
                    }
                >
                    ⬇ Download CSV
                </button>
            </div>



            {/* ---------- temperature ---------- */}

            <LineChart
                width={1000}
                height={260}
                data={chartData}
                syncId="history"
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onDoubleClick={onDoubleClick}
            >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                    dataKey="ts"
                    type="number"
                    domain={[zoom.left, zoom.right]}
                    allowDataOverflow
                    tickFormatter={(ts) =>
                        new Date(ts).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                        })
                    }
                />

                <YAxis domain={tempDomain} />
                {zoom.refLeft && zoom.refRight && (
                    <ReferenceArea
                        x1={zoom.refLeft}
                        x2={zoom.refRight}
                        strokeOpacity={0.25}
                    />
                )}
                <Tooltip
                    labelFormatter={ts =>
                        new Date(ts).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit"
                        })
                    }
                />



                {selectedRooms.map(room => (
                    <Line
                        key={room + "_temp"}
                        dataKey={room + "_temp"}
                        type="monotone"
                        stroke={ROOM_COLORS[room]}
                        dot={false}
                        hide={hiddenRooms[room]}
                    />
                ))}
            </LineChart>

            {/* ---------- humidity ---------- */}

            <h4>Humidity</h4>

            <LineChart
                width={1000}
                height={260}
                data={chartData}
                syncId="history"
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
            >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                    dataKey="ts"
                    type="number"
                    domain={[zoom.left, zoom.right]}
                    allowDataOverflow
                    tickFormatter={(ts) =>
                        new Date(ts).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                        })
                    }
                />
                {zoom.refLeft && zoom.refRight && (
                    <ReferenceArea
                        x1={zoom.refLeft}
                        x2={zoom.refRight}
                        strokeOpacity={0.25}
                    />
                )}
                <YAxis domain={humidDomain} />

                <Tooltip
                    labelFormatter={ts =>
                        new Date(ts).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit"
                        })
                    }
                />

                {selectedRooms.map(room => (
                    <Line
                        key={room + "_humid"}
                        dataKey={room + "_humid"}
                        type="monotone"
                        stroke={ROOM_COLORS[room]}
                        dot={false}
                        hide={hiddenRooms[room]}
                    />
                ))}
                <Legend
                    formatter={(value) =>
                        value.replace("_humid", "").replace("_", " ").toUpperCase()
                    }

                    onClick={(e) =>
                        toggleRoom(
                            e.dataKey.replace("_humid", "")
                        )
                    }
                />


            </LineChart>
        </div>
    );
}
