import React, {useContext, useState, useEffect} from "react";
import "./style.css";
import {ImagesTab} from "./ImagesTab.jsx";
import {DataContext} from "../../communication/DataContext.jsx";
import Plot from 'react-plotly.js';
import {TimelineTab} from "./TimelineTab.jsx";

export const MasterTabs = ({data, toggleHide, toggleSize, sizeMode, setSizeMode}) => {
    const tabs = ["Light Sensors", "Cameras", "Images", "Errors", "Timeline", "Predictions"];
    const [activeTab, setActiveTab] = useState("Light Sensors");
    const {
        getErrors
    } = useContext(DataContext);
    const [errors, setErrors] = useState({});
    const [fetchedFor, setFetchedFor] = useState(null);
    const lightSensors = ["bouncer_ls", "camFL_of", "cam0_of", "cam1_of", "cam2_of", "cam3_of", "sorter_ls"];
    const cameras = ["camFL", "camNAT", "cam0", "cam1", "cam2", "cam3"];
    const lsTab = () => {
        return (
            <div className={"ls-tab"}>
                <div className={"ls-grid"}>
                    {lightSensors.map(sensor => {
                        const testData = data?.ls_test?.[sensor] || {};
                        const readData = data?.ls_read?.[sensor] || {};

                        return (
                            <div key={sensor}>
                                <div className={"ls-sensor"}>
                                    <b className={"ls-name"}>{sensor}</b>
                                    <div
                                        className={`test-result ${testData.success === true ? ' pass' : testData.success === false ? ' fail' : ''}`}></div>
                                    <b>{typeof readData.volt === 'number' ? readData.volt.toFixed(4) : "N/A"}</b></div>
                                <p>{testData.info_msg || ""}</p>
                                <p style={{color: "var(--warnning-red)"}}>{testData.error_msg || ""}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        )
    }

    const predTab = () => {
        const predictions = data?.pred || [];

        // Compute ECDF
        const sorted = [...predictions].sort((a, b) => a - b);
        const y = sorted.map((_, i) => (i + 1) / sorted.length);

        return (
            <div>
                <Plot
                    data={[
                        {
                            x: sorted,
                            y: y,
                            type: 'scatter',
                            mode: 'lines+markers',
                            line: { shape: 'hv' }, // step-like ECDF
                            marker: { size: 4 },
                            name: 'ECDF',
                        }
                    ]}
                    layout={{
                        title: 'Empirical CDF of Predictions',
                        xaxis: { title: 'Prediction Value' },
                        yaxis: { title: 'ECDF', range: [0, 1] },
                        autosize: true,
                        margin: { t: 30, l: 40, r: 10, b: 40 },
                    }}
                    style={{ width: "100%", height: "300px" }}
                    useResizeHandler={true}
                />
            </div>
        );
    };


    const camTab = () => {
        return (
            <div className={"ls-tab"}>
                <div className={"ls-grid"}>
                    {cameras.map(cam => {
                        const testData = data?.cams_test?.[cam] || {};

                        return (
                            <div key={cam}>
                                <div className={"ls-sensor"}>
                                    <b className={"ls-name"}>{cam}</b>
                                    <div
                                        className={`test-result ${testData.success === true ? ' pass' : testData.success === false ? ' fail' : ''}`}></div>
                                </div>
                                <p>{testData.info_msg || ""}</p>
                                <p style={{color: "var(--warnning-red)"}}>{testData.error_msg || ""}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        )
    }
    useEffect(() => {
        if (activeTab && activeTab === "Errors") {
            const machineId = data.machine_id;

            const fetchErrors = async () => {
                try {
                    const err = await getErrors(machineId);
                    console.log("errors are", err);
                    setErrors(err);
                } catch (e) {
                    console.error("Failed to get errors:", e);
                }
            };

            fetchErrors();
        }
    }, [data, activeTab]);

    const errorTab = () => {
        const sortedEntries = errors
            ? Object.entries(errors).sort((a, b) => new Date(b[0]) - new Date(a[0])) : [];
        return (
            <div style={{
                maxHeight: "300px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column-reverse",
                border: "1px solid #ccc",
                padding: "10px"
            }}>
                {sortedEntries.map(([ts, msg]) => (
                    <div key={ts} style={{padding: "4px 0", borderBottom: "1px solid #eee"}}>
                        <code style={{color: "#888", marginRight: 8}}>{ts}</code>
                        <span>{msg}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className={`master-tabs-container`}>
            <div className="master-tabs-header">
                {tabs.map(tab => (
                    <div
                        key={tab}
                        className={`master-tab ${activeTab === tab ? "active" : ""}`}
                        onClick={() => {
                            setActiveTab(tab);
                            if (sizeMode === "hidden") {
                                setSizeMode("small");
                            }
                            if (tab === "Images") {
                                setSizeMode("full")
                            }
                        }
                        }
                    >
                        <b>{tab}</b>
                    </div>
                ))}

            </div>


            <div className="master-tab-content">
                <div className=" tabs-controls ">
                    <span className=" tabs-icon" title="Toggle size" onClick={toggleSize}>#</span>
                    <span className=" tabs-icon" title="Hide/show" onClick={toggleHide}>_</span>
                </div>
                {sizeMode !== "hidden" && (
                    <div>
                        {activeTab === "Light Sensors" && lsTab()}
                        {activeTab === "Cameras" && camTab()}
                        {activeTab === "Images" && <ImagesTab machineData={data}/>}
                        {activeTab === "Errors" && errorTab()}
                        {activeTab === "Predictions" && predTab()}
                        {activeTab === "Timeline" && (
                            <TimelineTab machineId={data.machine_id}/>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};
