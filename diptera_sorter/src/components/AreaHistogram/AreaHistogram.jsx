import React, {useEffect} from "react";
import Plot from "react-plotly.js";
import {areaBoundaryMarkers} from "./areaBounds.js";
import {useState} from "react";

export const AreaHistogram = ({className, width, height, values, bounds = []}) => {
    const [x, setX] = useState(values);

    useEffect(() => {
        setX(values);
    }, [values]);

    const markers = areaBoundaryMarkers(bounds);

    let trace = {
        x: x,
        type: "histogram",
        histnorm: "probability",
        marker: {
            color: "#b5b5b5",
        },
    };

    return (
        <div className={className}>
            <Plot
                style={{width: width || "100%", height}}
                useResizeHandler
                config={{responsive: true}}
                data={[trace]}
                layout={{
                    autosize: true,
                    width: width,
                    height: height,
                    margin: {
                        l: 30, // Left padding
                        r: 20, // Right padding
                        t: 20, // Top padding
                        b: 20, // Bottom padding
                    },

                    yaxis: {showgrid: false},
                    shapes: markers.map(({value}) => ({
                        type: "line", x0: value, x1: value,
                        y0: 0, y1: 1, yref: "paper",
                        line: {color: "#181818", width: 1, dash: "dash"},
                    })),
                    annotations: markers.map(({value, text}) => ({
                        x: value, y: 1, xref: "x", yref: "paper", text,
                        showarrow: false, yanchor: "bottom", font: {size: 11},
                    })),
                }}
            />
        </div>
    );
};
