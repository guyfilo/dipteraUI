import React, { useContext, useEffect, useState } from "react";
import {DataContext} from "../../communication/DataContext.jsx";
import SessionReportLine from "./SessionReportLine.jsx";
import "./style.css";
import {Checkbox} from "../../components/Checkbox/index.jsx";
import MultiSelectDropdown from "../../components/MultiSelectDropdown/MultiSelectDropdown.jsx";
import ReportsMailButton from "./ReportsMailButton.jsx";
import subtract from "../SessionSetup/Subtract.svg";
import subtractBack from "../SessionSetup/Subtract-back.svg";
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


const Charging = () => {
    const [angle, setAngle] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setAngle(prev => prev + 1);
        }, 10);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="session-setup-in">
            <div
                className="overlap-group"
                style={{
                    transform: `rotate(${angle}deg)`,
                    transition: "transform 0.1s linear",
                }}
            >
                <img className="subtract" alt="Subtract" src={"/Subtract.svg"} />
                <img className="subtract" alt="Subtract" src={"Subtract-back.svg"} />
            </div>
        </div>
    );
};

const ReportsScreen = () => {
    const { reports, fetchReports, fetchChartsData, chartsDataMap} = useContext(DataContext);
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
        return <Charging />;
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
                height: "100%",
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
                        const info = row.session_info;
                        const data = row.session_data;
                        if (!data || data.length === 0) return null;
                        const ignore_cols = ["session_id", "_date", "_start_ts"];
                        const columns = Object.keys(data[0]).filter((k) => !ignore_cols.includes(k));
                        console.log("columns", columns);
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
            </div>

        </div>
    );
};

export default ReportsScreen;
