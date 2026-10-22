import SessionViewSwitch from "../../components/SessionNotebook/SessionViewSwitch.jsx";
import SessionNotebook from "../../components/SessionNotebook/SessionNotebook.jsx";
import React, {useContext, useEffect, useMemo, useState, useRef} from "react";
import {DataContext} from "../../communication/DataContext.jsx";
import ReportsMailButton from "./ReportsMailButton.jsx";
import "./style.css"
import {Checkbox} from "../../components/Checkbox/index.jsx";
import Plot from "react-plotly.js";
import {generateColorMap, PieChart} from "../../components/PieChart/LivePieChart.jsx";

const ReportTitle = ({title}) => {
    const textRef = useRef(null);
    const [textWidth, setTextWidth] = useState(0);
    useEffect(() => {
        const text = textRef.current;
        if (!text) return;
        const measure = () => setTextWidth(Math.ceil(text.getBoundingClientRect().width));
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(text.parentElement);
        document.fonts.addEventListener("loadingdone", measure);
        return () => {
            observer.disconnect();
            document.fonts.removeEventListener("loadingdone", measure);
        };
    }, [title]);
    return <b className="title" data-expandable={textWidth > 300}
              style={{"--report-title-expanded-width": `${Math.min(500, Math.max(300, textWidth))}px`}}
              title={title}>
        <span ref={textRef}>{title}</span>
    </b>;
};

const DownloadIcon = ({className = "icon", onClick}) => (
    <svg className={className} width="48" height="48" viewBox="0 0 48 48" fill="none" onClick={onClick}>
        <path
            d="M42 30V38C42 39.0609 41.5786 40.0783 40.8284 40.8284C40.0783 41.5786 39.0609 42 38 42H10C8.93913 42 7.92172 41.5786 7.17157 40.8284C6.42143 40.0786 6 39.0609 6 38V30M14 20L24 30M24 30L34 20M24 30V6"
            stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

function ChartsPane({charts}) {
    if (!charts) return null;
    const machines = [...new Set([charts.loop_case_pie, charts.sex_pie, charts.fl_pie, charts.area_histogram]
        .flatMap(data => Object.keys(data || {})))];
    const [selectedMachine, setSelectedMachine] = useState(machines.at(0));


    const [selected, setSelected] = React.useState(Object);
    // Prefer the "total" slice if provided by backend; otherwise sum on the fly.
    const getSlice = (data, namesKey, valuesKey) => {
        let pie_data = data;

        let labels = Object.keys(pie_data);

        return {labels: labels, values: labels.map((k) => pie_data[k])};
    };
    const getHistogram = (data) => {
        let hist = data;

        const labels = Object.keys(hist);
        const counts = Object.values(hist);
        const parsedBins = labels.map(label => {
            const match = label.match(/\[(.*),/);
            return match ? parseFloat(match[1]) : 0;
        });
        const sorted = parsedBins
            .map((x, i) => ({x: x, label: labels[i], y: counts[i]}))
            .sort((a, b) => a.x - b.x);
        return {x: sorted.map(d => d.x), y: sorted.map(d => d.y)};
    }

    const fl = Object.fromEntries(
        Object.entries(charts.fl_pie).map(([key, value]) =>
            [key, getSlice(value)])
    );
    const sex = Object.fromEntries(
        Object.entries(charts.sex_pie).map(([key, value]) =>
            [key, getSlice(value)])
    );
    const loop = Object.fromEntries(
        Object.entries(charts.loop_case_pie).map(([key, value]) =>
            [key, getSlice(value)])
    );
    const area = Object.fromEntries(
        Object.entries(charts.area_histogram).map(([key, value]) =>
            [key, getHistogram(value)])
    );
    const colors = generateColorMap(Object.keys(charts.area_histogram).length);
    const colorsMap = Object.fromEntries( Object.keys(charts.area_histogram).
    map((val, i) => [val, colors[i]]));

    const plotLayout = useMemo(() => ({
        autosize: true,
        title: {
            text: "Larvae area (mm²)",
            font: {
                family: "sans-serif",
                size: 16,
                color: "#707070"
            }
        },
        paper_bgcolor: "rgba(0,0,0,0)", // transparent outer background
        plot_bgcolor: "rgba(0,0,0,0)",  // transparent inner plot background

        margin: {
            l: 30,
            r: 30,
            t: 30,
            b: 20,
        }
    }), []);
    const plotData = useMemo(() => (
        Object.entries(area).map(([key, value]) => ({
            type: "line",
            x: value.x,
            y: value.y,
            name: key,
            line: {
                color: colorsMap[key],
                width: 3,
            },

        }))
    ), []);

    return (
        <div className={"report-charts"}>
            <div className={"report-pies-container"}>
                <select
                    value={selectedMachine}
                    onChange={(e) => setSelectedMachine(e.target.value)}
                    className={"select-machine"}
                >
                    {
                        machines.map((m, i) => (
                            <option key={i} value={m}>{m}</option>
                        ))
                    }
                </select>
                <div className={"pies-overlay"} >
                    {loop[selectedMachine] ? <PieChart title={"Targets"}
                              labels={loop[selectedMachine].labels}
                              values={loop[selectedMachine].values}
                              width={"100%"} height={250}
                              className={"report-pie"}
                    /> : <p>Output counts unavailable.</p>}
                    {sex[selectedMachine] ? <PieChart title={"Sex"}
                              labels={sex[selectedMachine].labels}
                              values={sex[selectedMachine].values}
                              width={"100%"} height={250}
                              className={"report-pie"}
                    /> : <p>Sex data unavailable.</p>}
                    {fl[selectedMachine] ? <PieChart title={"Fluorescent"}
                              labels={fl[selectedMachine].labels}
                              values={fl[selectedMachine].values}
                              width={"100%"} height={250}
                              className={"report-pie"}
                    /> : <p>Fluorescent data unavailable.</p>}

                </div>
            </div>

            <Plot
                className={"report-histogram"}
                style={{width: "100%", height: 250}}
                useResizeHandler
                data={plotData}
                layout={plotLayout}
                config={{ responsive: true }}
            />
        </div>
    );
}

const pretty = (key, val) => {
    if (!val && val !== 0) return "-";
    if (key === "title") return String(val).replaceAll("_", " ");
    if (key === "larva size") return `${Number(val).toFixed(2)}`;
    if (key === "good size rate") return `${Number(100 * val).toFixed(2)}%`;
    if (key === "machine_ids") return Array.isArray(val) ? val.join(",") : String(val);
    if (key.includes("%")) return `${Number(100 * val).toFixed(1)}`;
    return String(val);
};

export default function SessionReportLine({
                                              info,
                                              data,
                                              columns,
                                              selectedMachines,
                                              isSelected,
                                              setSelected,
                                              onToggleSelected,
                                              onDownload,
                                              ReportsMailBtn, // pass ReportsMailButton
                                          }) {
    const sessionId = info.session_id;
    const [expanded, setExpanded] = useState(false);
    const [mode, setMode] = useState("table"); // "table" | "charts" | "notebook"

    const {fetchChartsData, chartsDataMap} = useContext(DataContext);
    const charts = chartsDataMap?.[sessionId];

    // When expanding: fetch charts once if not cached
    useEffect(() => {
        if (expanded && !charts) {
            fetchChartsData(sessionId).catch(console.error);
        }
    }, [expanded]);

    const showChartsSwitch = Boolean(expanded);

    return (
        <div className="session-report-line">
            <Checkbox
                style={{position: "relative", top: "25px"}}
                boolVar={isSelected}
                setBoolVar={(val) => {
                    setSelected((prev) =>
                        val
                            ? [...prev, sessionId]            // add when checked
                            : prev.filter((id) => id !== sessionId) // remove when unchecked
                    );
                }}
            />
            <div className={`session-summary-window ${isSelected && "selected"}`} key={sessionId}>
                <div className="session-summary-header" onClick={() => setExpanded((v) => !v)}>
                    <img
                        className={"window-arrow"}
                        alt={"v"}
                        src={`/arrow-${expanded ? "hide" : "expand"}.svg`}
                        style={{marginRight: 8}}
                    />
                    <div className="report-title-container">
                        <ReportTitle title={pretty("title", info["session_title"])}/>
                        <span className="report-session-id">{sessionId}</span>
                    {info.report_status === "partial" && (
                        <span className="report-partial-badge"
                              title={info.report_note || "Some session data is unavailable."}>
                            <span className="report-partial-dot" aria-hidden="true"/>
                            Partial report
                        </span>
                    )}
                    </div>
                    {["date", "target1", "target2", "specie", "machine_ids"].map((key) => (
                        <div className="header-val" key={key}>
                            <div className="sep"></div>
                            <p>{`${key === "specie" ? "Line" : key === "machine_ids" ? "Machines" : key.charAt(0).toUpperCase() + key.slice(1)}: ${pretty(key, info[key])}`}</p>
                        </div>
                    ))}
                    {/* view switch on the right */}

                </div>

                {expanded && (
                    <div className={"expand-report"}>
                        <div className={"chart-switch"}>
                            {showChartsSwitch && (
                                <SessionViewSwitch mode={mode} onChange={setMode} label="Report view"/>
                            )}
                        </div>
                        <div className="session-summary-description">
                            <p>{info["session_description"] || ""}</p>
                            {info.report_note && <p className="report-data-note" role="status">{info.report_note}</p>}
                        </div>

                        {mode === "table" && (
                            <div className="session-summary-data">
                                <table>
                                    <thead>
                                    <tr>{columns.map((k) => <th key={k}>{k.replaceAll("_", " ")}</th>)}</tr>
                                    </thead>
                                    <tbody>
                                    {data
                                        .filter(() => {
                                            if (!selectedMachines || selectedMachines.length === 0) return true;
                                            const machines = Array.isArray(info.machine_ids)
                                                ? info.machine_ids
                                                : String(info.machine_ids).split(",").map((m) => m.trim());
                                            return selectedMachines.some((m) => machines.includes(m));
                                        })
                                        .map((row, i) => (
                                            <tr key={i}>
                                                {columns.map((k) => <td key={k}>{pretty(k, row[k])}</td>)}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                            </div>
                        )}

                        {mode === "charts" && (charts ? <ChartsPane charts={charts}/> : <p role="status">Loading charts…</p>)}
                        {mode === "notebook" && <SessionNotebook key={sessionId} sessionId={sessionId} machineIds={info.machine_ids}/>}
                        <div className="reports-icons">
                            <DownloadIcon className={"download-icon reports-icon"} onClick={onDownload}/>
                            <ReportsMailBtn/>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
