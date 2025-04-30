import React from "react";
import "./style.css";

export const RunningStatistics = ({ stats }) => {
    const getMean = (arr) => {
        if (!arr || arr.length === 0) return 0;
        return arr.reduce((acc, val) => acc + val, 0) / arr.length;
    };

    const renderStat = (label, stat, unit = "") => {
        const value = Array.isArray(stat?.value) ? getMean(stat.value) : stat?.value;
        const hasWarning = stat?.warning;
        const msg = stat?.msg || "";

        return (
            <div
                className={`stat-item ${hasWarning ? "stat-item-warning" : ""}`}

            >
                <div className={`stat-label ${hasWarning ? "stat-item-warning" : ""}`}>{label}</div>
                <div className={`stat-value ${hasWarning ? "stat-item-warning" : ""}`}
                     title={hasWarning ? msg : ""}
                >{value?.toFixed(2)} {unit}</div>
            </div>
        );
    };

    return (
        <div className="running-statistics-grid">
            <div className="stat-item">
                <div className="stat-label">Bottle Target 1</div>
                <div className="stat-value">{stats?.target1_counter}</div>
            </div>
            {renderStat("Larva Size", stats?.mean_larva_area, "mm")}
            {renderStat("Pressure", stats?.pressure)}
            <div className="stat-item">
                <div className="stat-label">Bottle Target 2</div>
                <div className="stat-value">{stats?.target2_counter}</div>
            </div>
            {renderStat("Waiting Time", stats?.waiting_time, "sec")}
            {renderStat("Sorting Rate", stats?.sorting_rate, "sec")}
        </div>
    );
};
