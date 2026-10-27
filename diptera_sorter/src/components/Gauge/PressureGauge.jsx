import React from 'react';
import {Gauge} from './Gauge.jsx';

export const pressureGaugeConfig = (pressure) => {
    const target = pressure?.target;
    if (!Number.isFinite(target) || target <= 0) {
        return {
            maxValue: 60,
            ticks: [{value: 30}, {value: 40}, {value: 50}],
            subArcs: [{limit: 30}, {limit: 40}, {limit: 50}],
        };
    }
    const lower = Number.isFinite(pressure.lower_bound) && pressure.lower_bound >= 0 && pressure.lower_bound < target
        ? pressure.lower_bound : target * 0.95;
    const upper = Number.isFinite(pressure.upper_bound) && pressure.upper_bound > target
        ? pressure.upper_bound : target * 1.05;
    const maxValue = Math.max(60, Math.ceil(Math.max(target * 1.5, upper) / 10) * 10);
    return {
        maxValue,
        ticks: [{value: target}],
        subArcs: [
            {limit: lower, color: '#d9d9d9'},
            {limit: upper, color: '#7b9b88'},
            {limit: maxValue, color: '#d9d9d9'},
        ],
    };
};

export const pressureGaugeTitle = (pressure) => Number.isFinite(pressure?.target) && pressure.target > 0
    ? `Pressure · Target ${Number(pressure.target.toFixed(2))}` : 'Pressure';

export default function PressureGauge({pressure, style}) {
    return <Gauge style={style} val={pressure?.value} warning={pressure?.warning}
                  {...pressureGaugeConfig(pressure)}/>;
}
