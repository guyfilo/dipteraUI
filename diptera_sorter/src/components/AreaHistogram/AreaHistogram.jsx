import React, {useEffect} from "react";
import Plot from "react-plotly.js";
import {useState} from "react";

export const AreaHistogram = ({className, width, height, values}) => {
    const [x, setX] = useState(values);

    useEffect(() => {
        setX(values);
    }, [values]);

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
                data={[trace]}
                layout={{
                    width: width,
                    height: height,
                    margin: {
                        l: 30, // Left padding
                        r: 20, // Right padding
                        t: 20, // Top padding
                        b: 20, // Bottom padding
                    },

                    yaxis: {showgrid: false},
                    shapes: [
                        {
                            type: "line",
                            x0: 2,
                            x1: 2,
                            y0: 0,
                            y1: 1, // Stretches to full height (normalized for probability hist)
                            yref: "paper", // Use 'paper' to span full height
                            line: {
                                color: "#181818",
                                width: 1,
                                dash: "dash",
                            },
                        },
                        {
                            type: "line",
                            x0: 3,
                            x1: 3,
                            y0: 0,
                            y1: 1,
                            yref: "paper",
                            line: {
                                color: "#181818",
                                width: 1,
                                dash: "dash",
                            },
                        },
                    ],
                }}
            />
        </div>
    );
};
