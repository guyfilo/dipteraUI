import React, { useContext, useEffect, useState } from "react";
import {DataContext} from "../../communication/DataContext.jsx";
import SessionReportLine from "./SessionReportLine.jsx";
import "./style.css";
import {Checkbox} from "../../components/Checkbox/index.jsx";
import MultiSelectDropdown from "../../components/MultiSelectDropdown/MultiSelectDropdown.jsx";
import ReportsDateFilter from "./ReportsDateFilter.jsx";
import ReportsMailButton from "./ReportsMailButton.jsx";
import * as XLSX from "xlsx"; // at the top


const DownloadIcon = ({ className = "icon" , onClick}) => (
    <svg
        className={className}
        width="48"
        height="48"
        viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"
        onClick={onClick}
    >
        <path
            d="M42 30V38C42 39.0609 41.5786 40.0783 40.8284 40.8284C40.0783 41.5786 39.0609 42 38 42H10C8.93913 42 7.92172 41.5786 7.17157 40.8284C6.42143 40.0783 6 39.0609 6 38V30M14 20L24 30M24 30L34 20M24 30V6"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);


const ReportsLoading = ({progress = {}, initial = false}) => {
    const loaded = progress.loaded || 0;
    const total = progress.total || 0;
    const percent = total > 0 ? Math.min(100, Math.round(100 * loaded / total)) : null;
    return <div className={`reports-loading-panel ${initial ? "is-initial" : ""}`}>
        <div className="reports-loading-heading">
            <span className="reports-loading-spinner" aria-hidden="true"/>
            <div role="status">
                <strong>{initial ? "Loading session reports" : "Loading reports"}</strong>
                <p>{total > 0 ? `${loaded} of ${total} sessions ready` : "Finding available sessions…"}</p>
            </div>
            {percent !== null && <span className="reports-loading-percent" aria-hidden="true">{percent}%</span>}
        </div>
        <div className={`reports-loading-track ${percent === null ? "is-indeterminate" : ""}`}
             role="progressbar" aria-label="Reports loaded" aria-valuemin={0} aria-valuemax={100}
             aria-valuenow={percent ?? undefined}>
            <div style={percent !== null ? {width: `${percent}%`} : undefined}/>
        </div>
    </div>;
};

const ReportsSkeleton = () => <div className="reports-loading-skeletons" aria-hidden="true">
    {[0, 1, 2].map(index => <div className="reports-loading-skeleton" key={index}>
        <span/><span/><span/><span/>
    </div>)}
</div>;

const ReportsScreen = () => {
    const { reports, fetchReports, reportsLoading, reportsError, reportsProgress} = useContext(DataContext);
    const [expanded, setExpanded] = useState({}); // { session_id: true/false }
    const [selected, setSelected] = useState([]); // { session_id: true/false }
    const [selectedMachines, setSelectedMachines] = useState([]);
    const [selectedLines, setSelectedLines] = useState([]);
    const [selectedDates, setSelectedDates] = useState([]);

    const session_info_cols = {
        "date": "Date",
        "target1": "Target1",
        "target2": "Target2",
        "specie": "Line",
        "machine_ids": "Machines",
    };
    useEffect(() => {
        fetchReports();
    }, []);

    if (!reports || Object.keys(reports).length === 0) {
        return <div className="reports-screen">
            <b className="reports-screen-title">Sessions Reports</b>
            {reportsError
                ? <div className="reports-loading-error" role="alert">{reportsError} <button onClick={fetchReports}>Retry</button></div>
                : <><ReportsLoading progress={reportsProgress} initial/><ReportsSkeleton/></>}
        </div>;
    }

    const toggleExpand = (sessionId) => {
        setExpanded((prev) => ({ ...prev, [sessionId]: !prev[sessionId] }));
    };

    const parseTarget = (target) => {
        let label = [];
        if (target.includes("male") && !target.includes("female")) {
            label.push("Male");
        }
        if (target.includes("female") && !target.includes("female")) {
            label.push("Female");
        }
        if (target.includes("fl") && !target.includes("nfl")) {
            label.push("FL");
        }
        if (target.includes("nfl") && !target.includes("fl")) {
            label.push("Not FL");
        }
        return label.join(" & ");
    }

    const pretty = (key, val) => {
        if (!val && val !== 0) return "-";
        if (key === "title") return String(val).replaceAll("_", " ");
        if (key === "larva size") return `${ Number(val).toFixed(2)}mm²`;
        if (key === "good size rate") return `${ Number(100 * val).toFixed(2)}%`;
        if (key === "machine_ids") return val.join(",");
        if (key.includes("%")) return `${ Number(100 * val).toFixed(1)}%`;


        return String(val);
    };

    const downloadMultipleSessions = (sessions, selectedMachines = []) => {
        if (!sessions || sessions.length === 0) {
            alert("no sessions chosen");
            return;
        }

        // Merge all session data with their info
        const mergedData = sessions.flatMap(({ sessionId, sessionData, sessionInfo }) => {
            return sessionData
                .filter((row) => {
                    if (!selectedMachines || selectedMachines.length === 0) return true;

                    const rowMachines = Array.isArray(row.machine_ids)
                        ? row.machine_ids
                        : String(row.machine_ids || row.machine_id || "")
                            .split(",")
                            .map((m) => m.trim());

                    return selectedMachines.some((m) => rowMachines.includes(m));
                })
                .map((row) => ({
                    session_id: sessionId,
                    ...sessionInfo,
                    ...row,
                }));
        });

        if (mergedData.length === 0) {
            alert("No data to download for the selected machines.");
            return;
        }

        // Create a worksheet from JSON
        const ws = XLSX.utils.json_to_sheet(
            mergedData.map((row) => {
                const newRow = {};
                Object.keys(row).forEach((k) => {
                    newRow[k] = pretty(k, row[k]);
                });
                return newRow;
            })
        );

        // Create a workbook and append the worksheet
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sessions");

        // Export to Excel file
        XLSX.writeFile(wb, `sessions_${Date.now()}.xlsx`);
    };


    const filteredReports = Object.fromEntries( Object.entries(reports.reports).filter(([sessionId, session]) => {
        const info = session.session_info;

        // Machine filter
        const machineMatch =
            selectedMachines.length === 0 ||
            selectedMachines.some((m) => (info.machine_ids || []).includes(m));

        // Line filter
        const lineMatch =
            selectedLines.length === 0 ||
            selectedLines.includes(info.specie);

        // Date filter
        const dateMatch =
            selectedDates.length === 0 ||
            (info.date >= selectedDates[0] && info.date <= (selectedDates[1] || selectedDates[0]));

        return machineMatch && lineMatch && dateMatch;
    }));
    const reportsByDate = Object.entries(filteredReports)
        .filter(([, row]) => row.session_data?.length > 0)
        .sort(([, a], [, b]) => new Date(b.session_info.start_ts) - new Date(a.session_info.start_ts))
        .reduce((groups, entry) => {
            const date = entry[1].session_info.date || "unknown";
            (groups[date] ||= []).push(entry);
            return groups;
        }, {});
    const formatReportDate = date => {
        if (date === "unknown") return "Date unavailable";
        const parsed = new Date(`${date}T12:00:00`);
        return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString("en-GB", {
            weekday: "long", day: "numeric", month: "long", year: "numeric"
        });
    };

    return (
        <div className="reports-screen">
            <b className={"reports-screen-title"}>Sessions Reports</b>
            {reportsLoading && <ReportsLoading progress={reportsProgress} initial={Object.keys(reports.reports).length === 0}/>}
            {!reportsLoading && !reportsError && Object.keys(reports.reports).length === 0 && <div role="status">No reports available.</div>}
            {reportsError && <div role="alert">{reportsError} <button onClick={fetchReports}>Retry</button></div>}

            <div className={"reports-control"}
            >
                <Checkbox
                    boolVar={selected.length === Object.keys(filteredReports).length}
                    className={"choose-all-reports"}
                    setBoolVar={(checked) => {
                        if (checked) {
                            setSelected(Object.keys(filteredReports)); // select all
                        } else {
                            setSelected([]); // clear all
                        }
                    }}
                    text={"Choose All"}
                    style={{width:"max-content"}}
                />
                <div className="reports-filters">
                    <MultiSelectDropdown
                        label="Machines"
                        options={reports.machines}
                        selected={selectedMachines}
                        setSelected={setSelectedMachines}
                    />

                    <MultiSelectDropdown
                        label="Lines"
                        options={reports.lines}
                        selected={selectedLines}
                        setSelected={setSelectedLines}
                    />

                    <ReportsDateFilter
                        dates={reports.dates}
                        selected={selectedDates}
                        setSelected={setSelectedDates}
                    />
                    <DownloadIcon className={"download-icon reports-icon"}
                                  onClick={() => downloadMultipleSessions(selected.map((sessionId) => ({
                                      sessionId,
                                      sessionData: reports.reports[sessionId].session_data,
                                      sessionInfo: reports.reports[sessionId].session_info,
                                  })), selectedMachines)}
                    ></DownloadIcon>

                    <ReportsMailButton
                        className={"mail-icon reports-icon"}
                        selected={selected}
                        reports={reports}
                        selectedMachines={selectedMachines}
                        pretty_func={pretty}
                    ></ReportsMailButton>
                </div>

            </div>

            <div className={"reports-data-display"} aria-busy={reportsLoading}>
                {reportsLoading && Object.keys(reports.reports).length === 0 && <ReportsSkeleton/>}
                {Object.entries(reportsByDate)
                    .sort(([a], [b]) => b.localeCompare(a))
                    .map(([date, entries]) => <section className="reports-date-group" key={date}
                                                      aria-labelledby={`reports-day-${date}`}>
                        <h2 className="reports-date-separator" id={`reports-day-${date}`}>
                            {date === "unknown" ? <span>Date unavailable</span> : <time dateTime={date}>{formatReportDate(date)}</time>}
                            <span className="reports-date-count">{entries.length} {entries.length === 1 ? "session" : "sessions"}</span>
                        </h2>
                        {entries.map(([sid, row]) => {
                        const info = row.session_info;
                        const data = row.session_data;
                        if (!data || data.length === 0) return null;
                        const ignore_cols = ["session_id", "_date", "_start_ts"];
                        const columns = Object.keys(data[0]).filter((k) => !ignore_cols.includes(k));
                        const sessionId = info.session_id;

                        const onDownload = () =>
                            downloadMultipleSessions(
                                [{ sessionId, sessionData: data, sessionInfo: info }],
                                selectedMachines
                            );

                        return (
                            <SessionReportLine
                                key={sessionId}
                                info={info}
                                data={data}
                                columns={columns}
                                selectedMachines={selectedMachines}
                                isSelected={selected.includes(sessionId)}
                                setSelected={setSelected}
                                onToggleSelected={(checked) => {
                                    setSelected((prev) =>
                                        checked ? [...prev, sessionId] : prev.filter((id) => id !== sessionId)
                                    );
                                }}
                                onDownload={onDownload}
                                ReportsMailBtn={() => (
                                    <ReportsMailButton
                                        className={"mail-icon reports-icon"}
                                        selected={[sessionId]}
                                        reports={reports}
                                        selectedMachines={selectedMachines}
                                        pretty_func={pretty}
                                    />
                                )}
                            />
                        );
                        })}
                    </section>)}
            </div>

        </div>
    );
};

export default ReportsScreen;
