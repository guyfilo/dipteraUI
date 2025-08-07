import React, {useContext, useEffect, useState} from "react";
import { DataContext } from "../../communication/DataContext.jsx";
import "./style.css"
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
    );    const [subject, setSubject] = useState("Session Reports");

    const pretty = (key, value) => {
        if (pretty_func) return pretty_func(key, value);
        return value;
    };

    useEffect(() => {
        if (!selected?.length) {
            setMessage("No data selected");
        } else {
            setMessage(""); // Clear message if selection is valid
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

        const csvRows = [];

        sessions.forEach(({ sessionId, sessionData, sessionInfo }) => {
            sessionData
                .filter((row) => {
                    if (selectedMachines.length === 0) return true;
                    const machines = Array.isArray(row.machine_ids)
                        ? row.machine_ids
                        : String(row.machine_ids ?? row.machine_id ?? "")
                            .split(",")
                            .map((m) => m.trim());
                    return selectedMachines.some((m) => machines.includes(m));
                })
                .forEach((row) => {
                    const combinedRow = {
                        session_id: sessionId,
                        ...sessionInfo,
                        ...row,
                    };
                    if (csvRows.length === 0) {
                        csvRows.push(Object.keys(combinedRow).join(","));
                    }
                    csvRows.push(
                        Object.keys(combinedRow)
                            .map((k) =>
                                JSON.stringify(pretty(k, combinedRow[k]) ?? "")
                            )
                            .join(",")
                    );
                });
        });

        if (csvRows.length === 0) {
            setStatus("error");
            setTimeout(() => setStatus(null), 10000);
            setMessage("No matching data to send.");
        }

        const csvBlob = new Blob([csvRows.join("\n")], {
            type: "text/csv;charset=utf-8;",
        });

        const formData = new FormData();
        formData.append("email", email);
        formData.append("subject", subject);
        formData.append("file", csvBlob, "sessions.csv");

        try {
            const response = await sendEmail(formData);
            if (!response.ok) throw new Error("Failed to send email");
            setStatus("success");
            // Save email to localStorage if not already stored
            if (email && !previousEmails.includes(email)) {
                const updated = [...previousEmails, email].slice(-10); // keep last 10
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
                    {message ?
                        <div className="modal-content">
                            <img className={"exit-modal"} src={"/exit_button.svg"} alt={"X"}
                            onClick={() => setModalOpen(false)}></img>
                            {message}
                        </div> :
                        <div className="modal-content">
                            <img className={"exit-modal"} src={"/exit_button.svg"} alt={"X"}
                                 onClick={() => setModalOpen(false)}></img>                            <h3>Send Reports by Email</h3>
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
                    }

                </div>
            )}
        </div>
    );
};

export default ReportsMailButton;
