import React, {useState, useMemo, useRef} from "react";
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

export const generateColorMap = (count, from = "#bababa", to = "#373c40") =>
    Array.from({length: count}, (_, i) =>
        interpolateColor(from, to, i / Math.max(1, count - 1))
    );

const LivePieChart = ({width, height, selected}) => {
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
                style={{padding: "5px", width: "max-content"}}
            >
                <option value="loop_case">Loop Case</option>
                <option value="sex_classifications">Sex Classification</option>
                <option value="fl_classifications">FL Classification</option>
            </select>

            <PieChart
                width={width || 400}
                height={height || 400}
                labels={labels}
                values={values}
                colors={colors}
                title={`Pie Chart — ${dataType.replace(/_/g, " ")}`}
            />
        </div>
    );
};

export const PieChart = ({
                             width,
                             height,
                             labels,
                             values,
                             title,
                             colors,
                             className
                         }) => {
    colors = colors || generateColorMap(labels.length);
    return (
        <Plot
            className={className}
            data={[
                {
                    type: "pie",
                    labels,
                    values,
                    marker: {colors},
                    textinfo: "label+percent",
                    insidetextorientation: "radial",
                    textposition: "inside",
                    hole: 0, // change to >0 for donut
                },
            ]}
            layout={{
                title: {
                    text: title,
                    font: {
                        family: "sans-serif",
                        size: 16,
                        color: "#707070"
                    },
                },
                // height: height ? parseInt(height) : 400,
                // width: width ? parseInt(width) : 400,
                margin: {t: 50, l: 5, r: 5, b: 0},
                legend: {font: {size: 14}},
                showlegend: false,
                paper_bgcolor: "rgba(0,0,0,0)", // transparent outer background
                plot_bgcolor: "rgba(0,0,0,0)",  // transparent inner plot background

            }}
            config={{responsive: true}}
        />
    )
}


export default LivePieChart;
