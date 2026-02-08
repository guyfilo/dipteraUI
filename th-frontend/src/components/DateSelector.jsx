import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


export default function DateSelector({ dates, value, onChange }) {
    const allowed = new Set(dates);

    const startDate = value?.from ? new Date(value.from) : null;
    const endDate   = value?.to   ? new Date(value.to)   : null;

    return (
        <div style={{ display: "flex", gap: 10, alignItems: "center", width: "30%" , position: "relative" }}>
            <strong>select range:</strong>

            <DatePicker
                selectsRange
                startDate={startDate}
                endDate={endDate}
                onChange={([start, end]) => {
                    // always update, even partial
                    onChange({
                        from: start
                            ? start.toLocaleDateString("en-CA")
                            : null,
                        to: end
                            ? end.toLocaleDateString("en-CA")
                            : null,
                    });
                }}
                filterDate={(date) => {
                    const d = date.toISOString().split("T")[0];
                    return allowed.has(d);
                }}
                dateFormat="yyyy-MM-dd"
            />
        </div>
    );
}

