import React from 'react';
import {useState, useMemo, useEffect} from 'react';
import {LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Brush, ReferenceArea} from "recharts";

export const ROOM_COLORS = {
    "larva": "#bd4010",
    "adult_left": "#078209",
    "adult_right": "rgb(97,0,208)",
    "temp": "#17518f",
    "MahaneYehuda": "#17518f"
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
function downsampleByAverage(rows, maxPoints = 1000) {
    if (rows.length <= maxPoints) return rows;

    const bucketSize = Math.ceil(rows.length / maxPoints);
    const keys = Object.keys(rows[0]).filter(k => k !== "ts");

    const out = [];

    for (let i = 0; i < rows.length; i += bucketSize) {
        const bucket = rows.slice(i, i + bucketSize);
        const mid = bucket[Math.floor(bucket.length / 2)];

        const row = { ts: mid.ts };

        for (const k of keys) {
            const vals = bucket.map(r => r[k]).filter(v => v != null);
            const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
            row[k] = Number(avg.toFixed(2));

        }

        out.push(row);
    }

    return out;
}



export default function ChartCard({
                                      data,
                                      selectedRooms,
                                      fromdate,
                                      todate
                                  }) {

    /* ---------- state ---------- */

    const [hiddenRooms, setHiddenRooms] = useState({});
    const [isReady, setIsReady] = useState(false);

    const [zoom, setZoom] = useState({
        left: "dataMin",
        right: "dataMax",
        refLeft: null,
        refRight: null
    });

    /* ---------- build raw data ---------- */

    const rawData = useMemo(() => {
        if (!data || !data.length) return [];

        // 1. Collect all timestamps
        const allTs = data.flatMap(d =>
            d.timestamps.map(ts => new Date(ts).getTime())
        );

        // 2. Unique + sorted
        const timeline = Array.from(new Set(allTs)).sort((a, b) => a - b);

        // 3. Build lookup maps per dataset
        const indexMaps = data.map(d => {
            const m = new Map();
            d.timestamps.forEach((ts, i) => {
                m.set(new Date(ts).getTime(), i);
            });
            return m;
        });

        // 4. Build rows
        return timeline.map(ts => {
            const row = { ts };

            data.forEach((dataset, di) => {
                const idx = indexMaps[di].get(ts);

                row[dataset.room + "_temp"]  =
                    idx !== undefined ? dataset.temp[idx] : null;

                row[dataset.room + "_humid"] =
                    idx !== undefined ? dataset.humid[idx] : null;
            });

            return row;
        });
    }, [data]);


    /* ---------- reset on date change ---------- */

    useEffect(() => {
        setIsReady(false);
        setZoom({
            left: "dataMin",
            right: "dataMax",
            refLeft: null,
            refRight: null
        });
    }, [fromdate, todate]);

    /* ---------- mark ready ---------- */

    useEffect(() => {
        if (rawData.length) {
            setIsReady(true);
        }

    }, [rawData]);

    /* ---------- zoom-aware slicing ---------- */

    const visibleRaw = useMemo(() => {
        if (zoom.left === "dataMin" || zoom.right === "dataMax") {
            return rawData;
        }
        return rawData.filter(
            r => r.ts >= zoom.left && r.ts <= zoom.right
        );
    }, [rawData, zoom]);

    /* ---------- downsample ---------- */

    const chartData = useMemo(
        () => downsampleByAverage(visibleRaw, 1200),
        [visibleRaw]
    );

    /* ---------- guard LAST ---------- */

    if (!isReady) {
        return <div style={{ padding: 20 }}>Loading…</div>;
    }

    /* ---------- visibility state ---------- */

    const toggleRoom = (room) => {
        setHiddenRooms(h => ({
            ...h,
            [room]: !h[room]
        }));
    };

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
                        downloadCSV(rawData, `${fromdate}__${todate}__th_data_RAW.csv`)
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
                    formatter={(v, name) =>
                        typeof v === "number"
                            ? [v.toFixed(2), name]
                            : [v, name]
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
                    formatter={(v, name) =>
                        typeof v === "number"
                            ? [v.toFixed(2), name]
                            : [v, name]
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
