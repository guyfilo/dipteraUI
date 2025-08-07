import React, { useContext, useState } from "react";
import { DataContext } from "../../communication/DataContext.jsx";

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

    const pretty = (key, value) => {
        if (pretty_func) return pretty_func(key, value);
        return value;
    };

    const sendMail = async () => {
        const email = prompt("Enter recipient email:");
        if (!email) return;

        const subject = prompt("Enter mail subject:", "Session Reports");
        if (!subject) return;

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
            return alert("No matching data to send.");
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
        } catch (err) {
            setStatus("error");
        } finally {
            setTimeout(() => setStatus(null), 10000);
        }
    };

    return (
        <div>
            <MailIcon className={className} onClick={sendMail} status={status} />
        </div>
    );
};

export default ReportsMailButton;
