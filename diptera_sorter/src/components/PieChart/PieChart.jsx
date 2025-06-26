import React, { useState, useMemo, useRef } from "react";
import Plot from "react-plotly.js";

const interpolateColor = (startHex, endHex, factor) => {
    const hexToRgb = (hex) => {
        hex = hex.replace(/^#/, "");
        const bigint = parseInt(hex, 16);
        return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
    };

    const rgbToHex = (rgb) =>
        "#" + rgb.map((x) => x.toString(16).padStart(2, "0")).join("");

    const start = hexToRgb(startHex);
    const end = hexToRgb(endHex);
    const result = start.map((v, i) => Math.round(v + (end[i] - v) * factor));
    return rgbToHex(result);
};

const generateColorMap = (count, from = "#bababa", to = "#373c40") =>
    Array.from({ length: count }, (_, i) =>
        interpolateColor(from, to, i / Math.max(1, count - 1))
    );

const PieChart = ({ width, height, selected }) => {
    const [dataType, setDataType] = useState("loop_case");
    const [isHovered, setIsHovered] = useState(false);
    const latestDataRef = useRef({});

    const safeSelected = useMemo(() => {
        if (!isHovered && selected) {
            latestDataRef.current = selected;
        }
        return latestDataRef.current;
    }, [selected, isHovered]);

    const dataMap = safeSelected || {};
    const activeData = dataMap[dataType] || {};

    const labels = Object.keys(activeData);
    const values = Object.values(activeData);
    const colors = generateColorMap(labels.length);

    return (
        <div
            style={{
                width: width || "400px",
                height: height || "400px",
                display: "flex",
                flexDirection: "column",
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <select
                value={dataType}
                onChange={(e) => setDataType(e.target.value)}
                style={{ padding: "5px", width: "max-content" }}
            >
                <option value="loop_case">Loop Case</option>
                <option value="sex_classifications">Sex Classification</option>
                <option value="fl_classifications">FL Classification</option>
            </select>

            <Plot
                data={[
                    {
                        type: "pie",
                        labels,
                        values,
                        marker: { colors },
                        textinfo: "label+percent",
                        insidetextorientation: "radial",
                        hole: 0, // change to >0 for donut
                    },
                ]}
                layout={{
                    title: `Pie Chart — ${dataType.replace(/_/g, " ")}`,
                    height: height ? parseInt(height) : 400,
                    width: width ? parseInt(width) : 400,
                    margin: { t: 50, l: 20, r: 20, b: 20 },
                    legend: { font: { size: 14 } },
                }}
                config={{ responsive: true }}
            />
        </div>
    );
};

export default PieChart;
