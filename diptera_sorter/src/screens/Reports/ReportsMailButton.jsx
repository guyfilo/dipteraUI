import React, {useContext, useEffect, useState} from "react";
import { DataContext } from "../../communication/DataContext.jsx";
import "./style.css";
import * as XLSX from "xlsx";

const MailIcon = ({ className = "icon", onClick, status }) => {
    let color = "#bababa";
    if (status === "sending") color = "#fca447";   // Orange
    else if (status === "success") color = "#5adb80"; // Green
    else if (status === "error") color = "#fc4747";   // Red

    return (
        <svg
            className={className}
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            onClick={onClick}
            style={{ color }}
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
};

const ReportsMailButton = ({ selected, reports, selectedMachines, className, pretty_func }) => {
    const [status, setStatus] = useState(null);
    const { sendEmail } = useContext(DataContext);

    const [modalOpen, setModalOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [previousEmails, setPreviousEmails] = useState(
        JSON.parse(localStorage.getItem("previousEmails") || "[]")
    );
    const [subject, setSubject] = useState("Session Reports");

    const pretty = (key, value) => {
        if (pretty_func) return pretty_func(key, value);
        return value;
    };

    useEffect(() => {
        if (!selected?.length) {
            setMessage("No data selected");
        } else {
            setMessage("");
        }
    }, [selected]);

    const sendMail = async () => {
        setModalOpen(false);
        setStatus("sending");

        const sessions = selected.map((sessionId) => ({
            sessionId,
            sessionData: reports.reports[sessionId].session_data,
            sessionInfo: reports.reports[sessionId].session_info,
        }));

        // ---- build merged rows (respecting machine filter) ----
        const mergedData = [];
        sessions.forEach(({ sessionId, sessionData, sessionInfo }) => {
            (sessionData || [])
                .filter((row) => {
                    if (!selectedMachines || selectedMachines.length === 0) return true;
                    const machines = Array.isArray(row.machine_ids)
                        ? row.machine_ids
                        : String(row.machine_ids ?? row.machine_id ?? "")
                            .split(",")
                            .map((m) => m.trim());
                    return selectedMachines.some((m) => machines.includes(m));
                })
                .forEach((row) => {
                    mergedData.push({
                        session_id: sessionId,
                        ...sessionInfo,
                        ...row,
                    });
                });
        });

        if (mergedData.length === 0) {
            setStatus("error");
            setTimeout(() => setStatus(null), 10000);
            setMessage("No matching data to send.");
            return;
        }

        // ---- apply pretty() formatting per cell ----
        const formatted = mergedData.map((r) => {
            const o = {};
            Object.keys(r).forEach((k) => (o[k] = pretty(k, r[k])));
            return o;
        });

        // ---- create workbook with a single "Sessions" sheet ----
        const ws = XLSX.utils.json_to_sheet(formatted);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sessions");

        // Write workbook to ArrayBuffer and wrap in Blob
        const xlsxArray = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const xlsxBlob = new Blob([xlsxArray], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        // ---- prepare form data ----
        const formData = new FormData();
        formData.append("email", email);
        formData.append("subject", subject);
        formData.append("file", xlsxBlob, "sessions.xlsx");

        try {
            const response = await sendEmail(formData);
            if (!response.ok) throw new Error("Failed to send email");
            setStatus("success");

            // Save email to localStorage if not already stored
            if (email && !previousEmails.includes(email)) {
                const updated = [...previousEmails, email].slice(-10);
                localStorage.setItem("previousEmails", JSON.stringify(updated));
                setPreviousEmails(updated);
            }
        } catch (err) {
            setStatus("error");
        } finally {
            setTimeout(() => setStatus(null), 10000);
        }
    };

    return (
        <div>
            <MailIcon className={className} onClick={() => setModalOpen(true)} status={status} />

            {modalOpen && (
                <div className="modal-overlay">
                    {message ? (
                        <div className="modal-content">
                            <img
                                className={"exit-modal"}
                                src={"/exit_button.svg"}
                                alt={"X"}
                                onClick={() => setModalOpen(false)}
                            />
                            {message}
                        </div>
                    ) : (
                        <div className="modal-content">
                            <img
                                className={"exit-modal"}
                                src={"/exit_button.svg"}
                                alt={"X"}
                                onClick={() => setModalOpen(false)}
                            />
                            <h3>Send Reports by Email</h3>
                            <label>
                                To:
                                <input
                                    type="email"
                                    list="email-suggestions"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter email"
                                    required
                                />
                                <datalist id="email-suggestions">
                                    {previousEmails.map((em, i) => (
                                        <option key={i} value={em} />
                                    ))}
                                </datalist>
                            </label>

                            <label>
                                Subject:
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                />
                            </label>
                            <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
                                <button onClick={sendMail}>Send</button>
                                <button onClick={() => setModalOpen(false)}>Cancel</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ReportsMailButton;
