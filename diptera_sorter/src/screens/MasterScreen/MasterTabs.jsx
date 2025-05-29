import React, {useState} from "react";
import "./style.css";
import {ImagesTab} from "./ImagesTab.jsx";

export const MasterTabs = ({data, toggleHide, toggleSize, sizeMode}) => {
    let ls_data = {
        ls_test: {
            bouncer_ls: {success: true, info_msg: "calibrated to 3.1",},
            camFL_of: {success: true, info_msg: "calibrated to 3.1",},
            cam0_of: {success: false, info_msg: "calibrated to 3.1", error_msg: "error in calibration"},
            cam1_of: {success: false, info_msg: "calibrated to 3.1", error_msg: "error in calibration"},
            cam3_of: {success: false, info_msg: "calibrated to 3.1", error_msg: "error in calibration"},
            sorter_ls: {success: true, info_msg: "calibrated to 3.1",},
        },
        ls_read: {
            bouncer_ls: {volt: 3.12,},
            camFL_of: {volt: 3.12,},
            cam0_of: {volt: 3.12,},
            cam1_of: {volt: 3.12,},
            cam2_of: {volt: 3.12,},
            sorter_ls: {volt: 3.12,},
        },
        cams_test: {
            cam0: {success: true, info_msg: "calibrate to 3.1",},
            camFL: {success: true, info_msg: "calibrate to 3.1",},
            cam1: {success: false, info_msg: "daskmkgsd"},
            cam2: {success: true, info_msg: "daskmkxcvcxvxcvxgsd"},
            cam3: {success: true, info_msg: "daskmkgsd"},

        }
    }
    data = {...data, ...ls_data}
    const tabs = ["Light Sensors", "Cameras", "Images", "Errors"];
    const [activeTab, setActiveTab] = useState("Light Sensors");


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
                                    <b>{readData.volt ?? "N/A"}</b>
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



    return (
        <div className={`master-tabs-container`}>
            <div className="master-tabs-header">
                {tabs.map(tab => (
                    <div
                        key={tab}
                        className={`master-tab ${activeTab === tab ? "active" : ""}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        <b>{tab}</b>
                    </div>
                ))}

            </div>


            <div className="master-tab-content">
                <div className=" tabs-controls ">
                    <span className=" tabs-icon" title="Toggle size" onClick={toggleSize}>🗖</span>
                    <span className=" tabs-icon" title="Hide/show" onClick={toggleHide}>🗕</span>
                </div>
                {sizeMode !== "hidden" && (
                    <div>
                    {activeTab === "Light Sensors" && lsTab()}
                    {activeTab === "Cameras" && camTab()}
                    {activeTab === "Images" && <ImagesTab machineData={data}/>}
                    {activeTab === "Errors" && <div>Error logs or states</div>}
                    </div>
                )}

            </div>
        </div>
    );
};
