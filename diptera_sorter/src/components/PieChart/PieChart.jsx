import React, { useState, useMemo, useRef } from "react";
import { Chart } from "react-google-charts";

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

const generateColorMap = (count, from = "#bababa", to = "#398ccb") =>
    Array.from({ length: count }, (_, i) =>
        interpolateColor(from, to, i / Math.max(1, count - 1))
    );

const PieChart = ({ width, height, selected }) => {
    const [dataType, setDataType] = useState("loop_case");
    const [isHovered, setIsHovered] = useState(false);
    const latestDataRef = useRef({});

    // Save the latest relevant data to prevent updates during hover
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

    const chartData = useMemo(() => {
        const base =
            labels.length && values.length
                ? labels.map((label, i) => [label, values[i]])
                : [
                    ["Male", 10],
                    ["Female", 20],
                    ["Recycle", 30],
                    ["Junk", 40],
                ];
        return [["Label", "Value"], ...base];
    }, [dataType, safeSelected]);

    const slices = useMemo(() => {
        const colors = generateColorMap(chartData.length - 1);
        return Object.fromEntries(colors.map((color, i) => [i, { color }]));
    }, [chartData]);

    const options = useMemo(
        () => ({
            title: `Pie Chart — ${dataType.replace(/_/g, " ")}`,
            pieHole: 0,
            legend: { position: "right", textStyle: { fontSize: 16 } },
            tooltip: { textStyle: { fontSize: 14 } },
            chartArea: { width: "90%", height: "80%" },
            slices,
        }),
        [dataType, slices]
    );

    return (
        <div
            style={{
                width: "100px",
                height: "100px",
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

            <Chart
                chartType="PieChart"
                data={chartData}
                options={options}
                width={width}
                height={height}
            />
        </div>
    );
};

export default PieChart;
