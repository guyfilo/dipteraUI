import React, {useContext, useEffect, useState} from "react";
import {Button} from "../../components/Button/index.js";
import "./style.css"
import {DataContext} from "../../communication/DataContext.jsx";
import { useRef } from "react";

export const Tagger = () => {
    const {
        taggerData,
        sendCommand
    } = useContext(DataContext);

    const [data, setData] = useState(taggerData);
    const [editKey, setEditKey] = useState(null);

    const tableRef = useRef(null);  // << Add ref

    useEffect(() => {
        setData(taggerData);
    }, [taggerData]);

    // Auto-scroll when data updates
    useEffect(() => {
        if (tableRef.current) {
            tableRef.current.scrollTop = tableRef.current.scrollHeight;
        }
    }, [data]);

    const getRow = (item, key = null, extraClass = "", saved = false) => (
        <div className={`tagger-row-container ${extraClass}`}>
            {saved ? <div className={"already-saved-row"}>
                This barcode already exists. Would you like to edit?
                <div className={"tagger-row-btn"}
                     onClick={() => {
                         sendCommand("edit", ["tagger"], [], {barcode:item.barcode});}}
                >Yes</div>
                <div className={"tagger-row-btn"}
                     onClick={() => {
                         sendCommand("save", ["tagger"], []);}}
                >Cancel</div>

            </div> : null}
            <div className={`tagger-row`} key={key}>
                <div className="tagger-cell barcode-cell">
                    {saved ? (
                        <>
                            <b>Barcode: {item.barcode}</b>
                        </>
                    ) : (
                        <b>Barcode: {item.barcode}</b>
                    )}
                </div>
                <div className="col-sep"></div>
                {editKey === key ?
                    <>
                        <div className="tagger-cell barcode-cell edit-cell">
                            {"Are you sure you want to edit this line?"}
                            <div className={"tagger-row-btn"}
                                 onClick={() => {
                                     sendCommand("edit", ["tagger"], [], {barcode:item.barcode});
                                     setEditKey(null);
                                 }}
                            >Yes</div>
                            <div className={"tagger-row-btn"}
                                 onClick={() => setEditKey(null)}
                            >Cancel</div>
                        </div>
                    </>:
                    item.error ?
                    <>
                        <div className="tagger-cell error-cell">
                            {item.error === "garbage" ? "trash" : item.error === "duplicate" ? "duplicate" : null}
                            {item.error ? <img alt="error" src={`/tagger_${item.error}.svg`}></img> :
                                null}
                        </div>
                    </>:
                    <>
                        <div className="tagger-cell sex-cell">{item.sex ?? "?"}
                            {item.sex ? <img alt="sex" src={`/tagger_${item.sex}.svg`}></img> : null}
                        </div>
                        <div className="col-sep"></div>
                        <div className="tagger-cell fl-cell">
                            {item.is_fl === true ? "fluorescent" : item.is_fl === false ? "not fluorescent" : "?"}
                            {item.is_fl === true ? <img alt="sex" src={`/tagger_fl.svg`}></img> :
                                null}
                        </div>
                    </>

                }
                <div className="col-sep"></div>
                <div className="tagger-cell func-cell">
                    {key === "current" ?
                        <div className={"tagger-row-btn"}
                             onClick={() => {
                                 sendCommand("save", ["tagger"], []);}}
                        >Save</div> :
                        editKey === key ? <img alt={"edit"} src={"/tagger_edit_on.svg"}/> :
                            <img alt={"edit"}
                                 src={"/tagger_edit.svg"}
                                 onClick={() => setEditKey(key)}
                            />
                    }
                </div>
            </div>
        </div>
    );

    return (
        <div className={"tagger-container"}>
            <b>Tagger</b>
            <div className={"tagger-buttons"}>
                <div className={"tagger-start-btn tagger-btn"}
                     onClick={() => {
                         sendCommand("start", ["tagger"], []);}}
                >
                    <img className={"tagger-btn-icon"} alt={"start"} src={"/play_icon.svg"}></img>
                    start tagger
                </div>
                <div className={"tagger-stop-btn tagger-btn"}
                     onClick={() => {
                         sendCommand("stop", ["tagger"], []);}}
                >
                    <img className={"tagger-btn-icon"} alt={"stop"} src={"/stop_icon.svg"}></img>
                    stop tagger
                </div>
            </div>
            <div className={"tagger-table-container"} ref={tableRef}>
                {data && (
                    <div className="tagger-table">
                        {data.data?.map((item, index) =>
                            getRow(item, index, editKey === index ? "marked-row" : null)
                        )}

                        <div className="last-row">
                            {!data.data || !data.current_data ? (
                                <div className="tagger-row marked-row">
                                    <div className="tagger-cell barcode-cell">
                                        <b>Scan Barcode</b>
                                        <span className="typing-dots tagger-typing-dots">
                            <span></span><span></span><span></span>
                        </span>
                                    </div>
                                </div>
                            ) : (
                                getRow(data.current_data, "current", "marked-row", data.current_data.saved)
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};