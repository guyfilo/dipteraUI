import React, {useEffect, useState, useContext} from "react";
import {DataContext} from "../../communication/DataContext.jsx";
import "./style.css";

export const TimelineTab = ({machineId}) => {

    const {getTimeline, addTimelineEvent, editTimelineEvent} = useContext(DataContext);

    const [events, setEvents] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [eventType, setEventType] = useState("note");
    const [eventTs, setEventTs] = useState("");
    const [component, setComponent] = useState("");
    const [collapsedDates, setCollapsedDates] = useState({});
    const feedRef = React.useRef(null);
    const [visibleDate, setVisibleDate] = useState("");

    // ---------- FETCH ----------
    const collapseAll = () => {
        const collapsed = {};
        Object.keys(groupedEvents).forEach(d => {
            collapsed[d] = true;
        });
        setCollapsedDates(collapsed);
    };

    const expandAll = () => {
        const expanded = {};
        Object.keys(groupedEvents).forEach(d => {
            expanded[d] = false;
        });
        setCollapsedDates(expanded);
    };

    const toggleDate = (date) => {
        setCollapsedDates(prev => ({
            ...prev,
            [date]: !prev[date]
        }));
    };

    useEffect(() => {
        if (!machineId) return;

        const fetchTimeline = async () => {
            try {
                const res = await getTimeline(machineId);
                setEvents(res.events ?? []);
            } catch (err) {
                console.error("Failed to fetch timeline", err);
            }
        };

        fetchTimeline();
    }, [machineId]);


    // ---------- ADD EVENT ----------
    const handleAddEvent = async () => {
        if (!title) return;

        const newEvent = {
            machine_id: machineId,
            event_type: eventType,
            title,
            description,
            component: component || null,
            event_ts: eventTs ? new Date(eventTs).toISOString() : null,
        };

        try {
            const res = await addTimelineEvent(newEvent);

            setEvents(prev => [res.event, ...prev]);

            // reset
            setTitle("");
            setDescription("");
            setComponent("");
            setEventTs("");
            setEventType("note");

        } catch (e) {
            console.error("Failed to add event", e);
        }
    };


    // ---------- ADD COMMENT ----------
    const addComment = async (write_ts, comment) => {

        const res = await editTimelineEvent({
            machine_id: machineId,
            write_ts,
            comment
        });

        setEvents(prev =>
            prev.map(e =>
                e.write_ts === write_ts
                    ? {...e, comments: [...(e.comments ?? []), comment]}
                    : e
            )
        );
    };

    const groupedEvents = React.useMemo(() => {

        const sorted = [...events].sort(
            (a, b) => new Date(b.event_ts) - new Date(a.event_ts)
        );

        return sorted.reduce((acc, event) => {

            const dateKey = event.event_ts.slice(0,10);


            if (!acc[dateKey]) acc[dateKey] = [];

            acc[dateKey].push(event);

            return acc;

        }, {});

    }, [events]);


    return (
        <div className="timeline-container">

            {/* ---------- ADD EVENT ---------- */}

            <div className="timeline-add">

                <select
                    value={eventType}
                    onChange={e => setEventType(e.target.value)}
                >
                    <option value="note">Note</option>
                    <option value="session">Session</option>
                    <option value="warning">Warning</option>
                    <option value="soft_error">Soft Error</option>
                    <option value="hard_error">Hard Error</option>
                    <option value="hardware_update">Hardware Update</option>
                    <option value="software_update">Software Update</option>
                    <option value="other">Other</option>
                </select>


                <input
                    placeholder="Event title..."
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />

                <input
                    placeholder="Description..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                />

                <input
                    placeholder="Component (jet2 / pump / camera...)"
                    value={component}
                    onChange={e => setComponent(e.target.value)}
                />

                <input
                    type="datetime-local"
                    value={eventTs}
                    onChange={e => setEventTs(e.target.value)}
                    onFocus={() => {
                        if (!eventTs) {
                            const now = new Date();
                            const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
                                .toISOString()
                                .slice(0, 16);

                            setEventTs(local);
                        }
                    }}
                    title="Leave empty for 'now'"
                />

                <button onClick={handleAddEvent}>
                    Add Event
                </button>

            </div>

            <div className="timeline-controls">

                <button onClick={collapseAll}>
                    Fold All
                </button>

                <button onClick={expandAll}>
                    Expand All
                </button>

            </div>

            {/* ---------- EVENTS ---------- */}

            <div className="timeline-feed" ref={feedRef}>
                {Object.entries(groupedEvents).map(([date, events]) => {

                    const collapsed = collapsedDates[date];

                    return (
                        <div key={date} className={"timeline-date-cards"}>

                            {/* DATE HEADER */}

                            <div
                                className="timeline-date-header"
                                onClick={() => toggleDate(date)}
                            >
                                <span>{collapsed ? "▶" : "▼"}</span>
                                <b>{date}</b>
                                <span className="timeline-count">
                        ({events.length})
                    </span>
                            </div>


                            {!collapsed && events.map(event => (
                                <TimelineCard
                                    key={event.write_ts}
                                    event={event}
                                    onComment={addComment}
                                />
                            ))}

                        </div>
                    );
                })}

            </div>
        </div>
    );
};


const TimelineCard = ({event, onComment}) => {

    const [comment, setComment] = useState("");
    const [open, setOpen] = useState(false);
    const levelColor = {
        soft_error: "#ff4d4d",
        hard_error: "rgba(197,4,4,0.87)",
        warning: "#ffb84d",
        session: "#66ccff",
        note: "#9aa4ff"
    };

    return (
        <div className="timeline-card"
             style={{borderLeft: `6px solid ${levelColor[event.event_type] || "#ccc"}`}}
        >

            <div className="timeline-header"
                 onClick={() => setOpen(!open)}

            >
                <b>{event.title}</b>
                <span className="timeline-ts">
                    {new Date(event.event_ts).toLocaleString()}
                </span>
            </div>
            {open && <div className={"cad-body"}>
                <p>{event.description}</p>

                {/* comments */}
                <div className="timeline-comments">
                    {(event.comments ?? []).map((c, i) => (
                        <div key={i} className="timeline-comment">
                            {c}
                        </div>
                    ))}
                </div>

                <div className="timeline-comment-box">
                    <input
                        placeholder="Add comment..."
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                    />

                    <button onClick={() => {
                        if (!comment) return;
                        onComment(event.write_ts, comment);
                        setComment("");
                    }}>
                        Comment
                    </button>
                </div>
            </div>}


        </div>
    );
};
