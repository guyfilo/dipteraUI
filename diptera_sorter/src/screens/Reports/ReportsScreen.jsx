import React, { useContext, useEffect, useState } from "react";
import { DataContext } from "../../communication/DataContext.jsx";
import "./style.css";
import {Checkbox} from "../../components/Checkbox/index.jsx";
import MultiSelectDropdown from "../../components/MultiSelectDropdown/MultiSelectDropdown.jsx";
import ReportsMailButton from "./ReportsMailButton.jsx";


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
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const MailIcon = ({ className = "icon" , onClick}) => (
    <svg
        className={className}
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        onClick={onClick}
    >
        <path
            d="M44 12C44 9.8 42.2 8 40 8H8C5.8 8 4 9.8 4 12M44 12V36C44 38.2 42.2 40 40 40H8C5.8 40 4 38.2 4 36V12M44 12L24 26L4 12"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const ReportsScreen = () => {
    const { reports, fetchReports } = useContext(DataContext);
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
        return <div>Loading reports...</div>;
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
        if (key === "larva size") return Number(val).toFixed(2);
        if (key === "good size rate") return `${ Number(100 * val).toFixed(2)}%`;
        if (key === "machine_ids") return val.join(",");

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
                    // If no machine selected → keep all
                    if (!selectedMachines || selectedMachines.length === 0) return true;

                    // Determine machine for this row
                    const rowMachines = Array.isArray(row.machine_ids)
                        ? row.machine_ids
                        : String(row.machine_ids || row.machine_id || "")
                            .split(",")
                            .map((m) => m.trim());

                    return selectedMachines.some((m) => rowMachines.includes(m));
                })
                .map((row) => ({
                    session_id: sessionId,
                    ...sessionInfo, // Spread info first
                    ...row,         // Then row data
                }));
        });

        if (mergedData.length === 0) {
            alert("No data to download for the selected machines.");
            return;
        }

        // Collect all unique keys for CSV columns
        const allKeys = Array.from(
            mergedData.reduce((keys, row) => {
                Object.keys(row).forEach((k) => keys.add(k));
                return keys;
            }, new Set())
        );

        // Build CSV
        const csvRows = [
            allKeys.join(","), // Header
            ...mergedData.map((row) =>
                allKeys.map((k) => JSON.stringify(pretty(k, row[k]) ?? "")).join(",")
            ),
        ];
        const csvContent = csvRows.join("\n");

        // Trigger download
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `sessions_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
            selectedDates.includes(info.date);

        return machineMatch && lineMatch && dateMatch;
    }));

    return (
        <div
            style={{
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
            }}
        >
            <b className={"reports-screen-title"}>Sessions Reports</b>

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

                    <MultiSelectDropdown
                        label="Dates"
                        options={reports.dates}
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

            <div className={"reports-data-display"}>
                {Object.entries(filteredReports)
                    .sort(([, a], [, b]) => new Date(b.session_info.start_ts) - new Date(a.session_info.start_ts))
                    .map(([sid, row]) => {
                    const info = row["session_info"];
                    const data = row["session_data"];
                    if (!data || data.length === 0) return null;

                    const columns = Object.keys(data[0]);
                    const sessionId = info.session_id;
                    const isExpanded = !!expanded[sessionId];

                    return (
                        <div className="session-report-line">
                            <Checkbox
                                style={{position: "relative", top:"25px"}}
                                boolVar={selected.includes(sessionId)}
                                setBoolVar={(val) => {
                                    setSelected((prev) =>
                                        val
                                            ? [...prev, sessionId]            // add when checked
                                            : prev.filter((id) => id !== sessionId) // remove when unchecked
                                    );
                                }}
                            />
                            <div className="session-summary-window"
                                 key={sessionId}

                            >
                                {/* Header with basic info */}

                                <div className="session-summary-header"
                                     onClick={() => toggleExpand(sessionId)}

                                >
                                    <img
                                        className={"window-arrow"}
                                        alt={"v"}
                                        src={`/arrow-${isExpanded ? "expand" : "hide"}.svg`}
                                        style={{ marginRight: "8px" }}
                                    />
                                    <b className={"title"}>{pretty("title", info["session_title"])}</b>
                                    {Object.keys(session_info_cols).map((key) => (
                                        <div className="header-val" key={key}>
                                            <div className="sep"></div>
                                            <p>{session_info_cols[key]}: {pretty(key, info[key])}</p>
                                        </div>
                                    ))}
                                </div>

                                {isExpanded && (
                                    <>
                                        {/* Optional description */}
                                        <div className="session-summary-description">
                                            <p>{info["session_description"] || ""}</p>
                                        </div>

                                        {/* Data table */}
                                        <div className="session-summary-data">
                                            <table>
                                                <thead>
                                                <tr>
                                                    {columns.map((key) => (
                                                        <th key={key}>{key}</th>
                                                    ))}
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {data.filter((row) => {
                                                    if (selectedMachines.length === 0) return true; // show all if none selected

                                                    // Handle row.machine_ids as array or comma-separated string
                                                    const machines = Array.isArray(info.machine_ids)
                                                        ? info.machine_ids
                                                        : String(info.machine_ids).split(",").map((m) => m.trim());
                                                    return selectedMachines.some((m) => machines.includes(m));
                                                })
                                                    .map((row, rowIndex) => (
                                                        <tr key={rowIndex}>
                                                            {columns.map((key) => (
                                                                <td key={key}>{pretty(key, row[key])}</td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            <div className="reports-icons">
                                                <DownloadIcon className={"download-icon reports-icon"}
                                                              onClick={() =>
                                                                  downloadMultipleSessions([{
                                                                      sessionId,
                                                                      sessionData: data,
                                                                      sessionInfo: info,
                                                                  }], selectedMachines)}
                                                ></DownloadIcon>
                                                <ReportsMailButton
                                                    className={"mail-icon reports-icon"}
                                                    selected={[sessionId]}
                                                    reports={reports}
                                                    selectedMachines={selectedMachines}
                                                    pretty_func={pretty}
                                                ></ReportsMailButton>
                                            </div>

                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                    );
                })}
            </div>

        </div>
    );
};

export default ReportsScreen;
