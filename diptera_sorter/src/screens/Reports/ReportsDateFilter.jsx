import React, {useEffect, useRef, useState} from "react";

const dateKey = (year, month, day) => `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

export default function ReportsDateFilter({dates = [], selected, setSelected}) {
    const [open, setOpen] = useState(false);
    const available = new Set(dates);
    const latest = [...available].sort().at(-1);
    const [month, setMonth] = useState(() => (latest || dateKey(new Date().getFullYear(), new Date().getMonth(), 1)).slice(0, 7));
    const containerRef = useRef(null);
    const triggerRef = useRef(null);
    const [year, monthNumber] = month.split("-").map(Number);
    const firstWeekday = new Date(year, monthNumber - 1, 1).getDay();
    const daysInMonth = new Date(year, monthNumber, 0).getDate();

    useEffect(() => {
        if (!open) return;
        const onClick = event => {
            if (!containerRef.current?.contains(event.target)) setOpen(false);
        };
        const onKeyDown = event => {
            if (event.key === "Escape") {
                setOpen(false);
                triggerRef.current?.focus();
            }
        };
        document.addEventListener("pointerdown", onClick);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("pointerdown", onClick);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    const moveMonth = offset => {
        const next = new Date(year, monthNumber - 1 + offset, 1);
        setMonth(dateKey(next.getFullYear(), next.getMonth(), 1).slice(0, 7));
    };

    return <div className="reports-date-filter" ref={containerRef}>
        <button type="button" className={`reports-date-trigger ${selected.length ? "has-selection" : ""}`}
                ref={triggerRef} aria-expanded={open} aria-controls="reports-date-calendar"
                onClick={() => {
                    if (!open) setMonth((selected.at(-1) || latest || dateKey(new Date().getFullYear(), new Date().getMonth(), 1)).slice(0, 7));
                    setOpen(previous => !previous);
                }}>
            {selected.length ? `${selected[0]}${selected[1] ? ` – ${selected[1]}` : " – Select end"}` : "Select date range"}
        </button>
        {open && <div className="reports-date-calendar" id="reports-date-calendar" role="group" aria-label="Filter reports by date">
            <div className="reports-calendar-heading">
                <button type="button" aria-label="Previous month" onClick={() => moveMonth(-1)}>‹</button>
                <input type="month" aria-label="Calendar month" value={month}
                       onChange={event => {if (/^\d{4}-\d{2}$/.test(event.target.value)) setMonth(event.target.value);}}/>
                <button type="button" aria-label="Next month" onClick={() => moveMonth(1)}>›</button>
            </div>
            <div className="reports-calendar-grid">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => <span className="reports-calendar-weekday" key={day}>{day}</span>)}
                {Array.from({length: firstWeekday}, (_, index) => <span key={`blank-${index}`}/>)}
                {Array.from({length: daysInMonth}, (_, index) => {
                    const day = index + 1;
                    const key = dateKey(year, monthNumber - 1, day);
                    const hasReports = available.has(key);
                    const inRange = selected.length === 2 && key >= selected[0] && key <= selected[1];
                    return <button type="button" key={key}
                                   className={`reports-calendar-day ${hasReports ? "has-reports" : ""} ${inRange ? "in-range" : ""} ${selected.includes(key) ? "is-selected" : ""}`}
                                   aria-label={`${key}${hasReports ? ", sessions available" : ", no sessions"}`}
                                   aria-pressed={inRange || selected.includes(key)}
                                   onClick={() => setSelected(previous => previous.length === 1 ? [previous[0], key].sort() : [key])}>
                        {day}{hasReports && <span className="reports-calendar-dot" aria-hidden="true"/>}
                    </button>;
                })}
            </div>
            <p className="reports-calendar-help"><span className="reports-calendar-dot"/> Days with sessions · {selected.length === 1 ? "Select the end date" : "Select a start and end date"}</p>
            <div className="reports-calendar-footer">
                <button type="button" disabled={!selected.length} onClick={() => setSelected([])}>Clear dates</button>
                <button type="button" onClick={() => {setOpen(false); triggerRef.current?.focus();}}>Done</button>
            </div>
        </div>}
    </div>;
}
