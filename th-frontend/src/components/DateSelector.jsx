import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";   // <— REQUIRED

export default function DateSelector({ dates, value, onChange }) {
    const allowed = new Set(dates); // fast lookup

    return (
        <div>
            <strong>select date: </strong>
            <DatePicker
                selected={new Date(value)}
                onChange={(date) => {
                    const d = date.toISOString().split("T")[0];
                    if (allowed.has(d)) onChange(d);
                }}

                filterDate={(date) => {
                    const d = date.toISOString().split("T")[0];
                    return allowed.has(d);       // disable all other days
                }}

                dateFormat="yyyy-MM-dd"
            />
        </div>

    );
}
