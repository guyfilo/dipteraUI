import React, {useRef} from 'react';
import GaugeComponent from 'react-gauge-component';


export const Gauge = ({val, style, suffix = '', ticks, subArcs, minValue, maxValue, warning=false}) => {

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
                        style: {fontSize: 15}
                    },
                    ticks: ticks
                },
                valueLabel: {
                    formatTextValue: value => value + suffix,
                    style: {
                        fontSize: 40,
                        fontFamily: "var(--font-regular)",
                        fill: (!warning) ? "#707070": "var(--caution-orange)",
                        color: (!warning) ? "#707070": "var(--caution-orange)",
                        textShadow: "none",
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
