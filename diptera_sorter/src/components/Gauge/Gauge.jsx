import React, {useRef} from 'react';
import GaugeComponent from 'react-gauge-component';


export const Gauge = ({val, style, suffix = '', ticks, subArcs, minValue, maxValue}) => {

    return (
        <GaugeComponent
            style={style}
            value={val}
            type="radial"
            minValue={minValue}
            maxValue={maxValue}

            labels={{
                tickLabels: {
                    type: "outer",
                    defaultTickValueConfig: {
                        formatTextValue: (value) => value + suffix,
                        style: {fontSize: 20}
                    },
                    ticks: ticks
                },
                valueLabel: {
                    formatTextValue: value => value + suffix,
                    style: {
                        width: "33px",
                        fontSize: "60px",
                        fontFamily: "var(--font-regular)",
                        fill: "#707070",
                        color: "#707070",
                        textShadow: "none",
                        display: "flex",
                        alignItems: "center",
                    }
                }

            }}
            arc={{
                colorArray: ['rgb(217, 217, 217)', 'rgb(68, 68, 68)'],
                subArcs: subArcs,
                padding: 0.02,
                width: 0.3
            }}
            pointer={{
                elastic: true,
                animationDelay: 0
            }}
        />
    )
}
