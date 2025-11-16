import React, {useEffect, useRef, useState} from "react";
import axios from "axios";
import "./style.css";

axios.defaults.baseURL = "http://100.76.177.32:8000";

function Progress({state}) {
    if (!state || typeof state.cur === "undefined") return null;
    const percent = state.total > 0 ? Math.round((state.tagged / state.total) * 100) : 0;
    return (
        <div style={{marginBottom: 10}}>
            <p>Progress: <b>{state.cur + 1}</b> / {state.total} | Tagged: {state.tagged}</p>
            <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{width: `${percent}%`}}></div>
            </div>
        </div>
    );
}

export default function TaggerApp() {
    const [subjects, setSubjects] = useState([]);
    const [subject, setSubject] = useState("");
    const [openSessions, setOpenSessions] = useState([]);
    const [selectedOpen, setSelectedOpen] = useState("");
    const [taggerName, setTaggerName] = useState("");
    const [sessionId, setSessionId] = useState(null);
    const [sessionInfo, setSessionInfo] = useState(null);
    const [imagePath, setImagePath] = useState(null);
    const [tag, setTag] = useState("");
    const [message, setMessage] = useState("");
    const [state, setState] = useState(null);
    const [warning, setWarning] = useState(null);
    const [noImages, setNoImages] = useState(false);
    const [darkMode, setDarkMode] = useState(true);
    const [zoomPos, setZoomPos] = useState(null);
    const zoomFactor = 2; // You can set 2x, 3x, etc.
    const zoomSize = 200; // Size of the circular lens in pixels
    const containerRef = useRef(null);

    useEffect(() => {
        document.body.classList.toggle("dark", darkMode);
        document.body.classList.toggle("light", !darkMode);
    }, [darkMode]);

    // -------------------- AUTO CONTINUE SESSION --------------------
    useEffect(() => {
        // On page load, try to resume the last session
        const savedSession = localStorage.getItem("tagger_session");
        if (savedSession) {
            const parsed = JSON.parse(savedSession);
            if (parsed.sessionId && parsed.taggerName) {
                // try to continue existing in-memory session
                axios.post("/api/session/continue", { session_id: parsed.sessionId })
                    .then(async (res) => {
                        setSessionId(res.data.session_id);
                        setTaggerName(parsed.taggerName);
                        setSubject(res.data.subject);
                        setSessionInfo(res.data.info);
                        // get current image
                        const next = await axios.get("/api/image/next", { params: { session_id: res.data.session_id } });
                        setImagePath(next.data.image_path);
                        await updateCurrentTag(res.data.session_id, next.data.image_path);
                        setMessage("Session auto-continued");
                    })
                    .catch((err) => {
                        console.warn("No session found in memory:", err);
                        localStorage.removeItem("tagger_session");
                    });
            }
        }
    }, []);



    useEffect(() => {
        axios.get("/api/subjects").then((res) => setSubjects(res.data));
        axios.get("/api/session/open").then((res) => setOpenSessions(res.data.sessions || []));

    }, [sessionId]);

    useEffect(() => {
        const handleKeyDown = async (e) => {
            if (!imagePath || !sessionId) return;
            const char = e.key;

            if (char === "ArrowRight") {
                await nextImage(1);
            } else if (char === "ArrowLeft") {
                await nextImage(-1);
            } else if (char.length === 1 && /[a-zA-Z0-9]/.test(char)) {
                await axios.post("/api/image/tag", {
                    session_id: sessionId,
                    image_path: imagePath,
                    tag: char,
                });
                await updateCurrentTag();
            } else if (char === "Backspace" || char === "Delete") {
                await axios.post("/api/image/tag", {
                    session_id: sessionId,
                    image_path: imagePath,
                    delete: true,
                });
                await updateCurrentTag();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [imagePath, sessionId]);

    const startSession = async () => {
        if (!subject || !taggerName) {
            setWarning("Please fill in all fields");
            return;
        }
        try {
            const res = await axios.post("/api/session/create", {
                tagger_name: taggerName,
                subject: subject,
                skip_tagged_images: true,
            });
            setSessionId(res.data.session_id);
            setSessionInfo(res.data.info);
            const next = await axios.get("/api/image/next",
                {params: {session_id: res.data.session_id}});
            setImagePath(next.data.image_path);
            await updateCurrentTag(res.data.session_id, next.data.image_path);
            setMessage(next.data.msg);
            console.log(next);
            localStorage.setItem("tagger_session", JSON.stringify({
                sessionId: res.data.session_id,
                taggerName,
                subject
            }));
            return true;
        } catch (err) {
            // Make sure it's an axios error
            if (axios.isAxiosError(err) && err.response) {
                switch (err.response.status) {
                    case 410:               // <-- raised by your FastAPI endpoint
                                            // “No Images To Tag”
                        console.log("All done – no more images");
                        // do whatever: set state, navigate away, show a toast, etc.
                        setNoImages(true);
                        return null;

                    case 404:
                        console.error("Session not found");
                        break;

                    default:
                        console.error(`Unexpected error (${err.response.status})`, err);
                }
            } else {
                console.error("Network / CORS / unknown error", err);
            }
            throw err;                 // re-throw if you want the caller to handle it
        }

    };

    const continueSession = async () => {
        if (!selectedOpen) {
            setWarning("Please select a session to continue");
            return;
        }
        try {
            const res = await axios.post("/api/session/continue",
                { session_id: selectedOpen });
            setSessionId(res.data.session_id);
            setSessionInfo(res.data.info);

            // Get next image & state for that session
            const next = await axios.get("/api/image/next", { params: { session_id: res.data.session_id } });
            setImagePath(next.data.image_path);
            await updateCurrentTag(res.data.session_id, next.data.image_path);
            localStorage.setItem("tagger_session", JSON.stringify({
                sessionId: res.data.session_id,
                taggerName,
                subject
            }));
            setMessage("Session continued");
        } catch (err) {
            console.error(err);
            setWarning("Failed to continue session");
        }
    };

    const nextImage = async (step = 1) => {
        const route = step === 1 ? "next" : "prev";
        try {
            const res = await axios.get(`/api/image/${route}`, {params: {session_id: sessionId}});
            setImagePath(res.data.image_path);
            setMessage(res.data.msg);
            console.log(res.data);
            await updateCurrentTag(sessionId, res.data.image_path);
            return true;
        } catch (err) {
            // Make sure it's an axios error
            if (axios.isAxiosError(err) && err.response) {
                switch (err.response.status) {
                    case 410:               // <-- raised by your FastAPI endpoint
                                            // “No Images To Tag”
                        console.log("All done – no more images");
                        setNoImages(true);
                        // do whatever: set state, navigate away, show a toast, etc.
                        return null;

                    case 404:
                        console.error("Session not found");
                        break;

                    default:
                        console.error(`Unexpected error (${err.response.status})`, err);
                }
            } else {
                console.error("Network / CORS / unknown error", err);
            }
            throw err;                 // re-throw if you want the caller to handle it
        }
    };

    const updateCurrentTag = async (sessId = sessionId, imgPath = imagePath) => {
        const res = await axios.get("/api/image/get_tags", {
            params: {
                session_id: sessId,
                image_path: imgPath,
            },
        });
        setTag((res.data.tags || []).join(", "));
        await updateState(sessId);
    };

    const updateState = async (sessId = sessionId) => {
        const res = await axios.get("/api/image/get_state", {
            params: {session_id: sessId}
        });
        setState(res.data.state);
    };

    const saveSession = async (silent = false) => {
        await axios.post("/api/session/save", sessionId, {
            headers: {'Content-Type': 'application/json'}
        });
        if (!silent) setMessage("Session saved");
    };

    const endSession = async () => {
        await axios.post("/api/session/exit", sessionId, {
            headers: {'Content-Type': 'application/json'}
        });
        localStorage.removeItem("tagger_session");
        setSessionId(null);
        setSessionInfo(null);
        setImagePath(null);
    };
    useEffect(() => {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(prefersDark);
    }, []);
    return (
        <div className="tagger-container">
            <button
                className="tagger-button"
                onClick={() => setDarkMode(!darkMode)}
                style={{position: "absolute", top: 10, left: 10, width: 120}}
            >
                {darkMode ? "Light Mode" : "Dark Mode"}
            </button>
            <img alt={"diptera_logo"} src={"/diptera_logo.svg"} className={"logo"}></img>
            {!sessionId ? (
                    <div className="tagger-content">
                        <h2>Start or Continue Session</h2>
                        <h4>Start new session</h4>
                        tagger name:
                        <input
                            placeholder="Your Name"
                            value={taggerName}
                            onChange={(e) => setTaggerName(e.target.value)}
                        />
                        tagging subject:
                        <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                            <option value="">Select Subject</option>
                            {subjects.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        <button className="tagger-button" onClick={startSession}>Start</button>
                        <h4>Continue open session</h4>
                        <select
                            value={selectedOpen}
                            onChange={(e) => setSelectedOpen(e.target.value)}
                            style={{marginBottom: 10}}
                        >
                            <option value="">Select an open session</option>
                            {openSessions.map((s) => (
                                <option key={s.session_id} value={s.session_id}>
                                    {s.tagger_name} — {s.subject} ({s.progress.tagged}/{s.progress.total})
                                </option>
                            ))}
                        </select>
                        <button className="tagger-button" onClick={continueSession}>Continue</button>

                        {warning && <div className="tagger-warning">{warning}</div>}
                    </div>
                )  :
                (
                    <div className="tagger-content-session">

                        <h3>Tagger: {taggerName}</h3>
                        <Progress state={state}/>
                        {imagePath && (
                            <div
                                ref={containerRef}
                                style={{
                                    position: "relative",
                                    width: "fit-content",
                                    marginTop: 10,
                                    cursor: "crosshair"
                                }}
                            >
                                <div
                                    ref={containerRef}
                                    onMouseMove={(e) => {
                                        const {left, top} = containerRef.current.getBoundingClientRect();
                                        const x = e.clientX - left;
                                        const y = e.clientY - top;
                                        setZoomPos({x, y});
                                    }}
                                    onMouseLeave={() => setZoomPos(null)}

                                >
                                    <img
                                        className="tagger-image"
                                        src={`http://100.76.177.32:8000/api/image/view?session_id=${sessionId}&image_path=${encodeURIComponent(imagePath)}`}
                                        alt="current"
                                    />

                                    {zoomPos && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: zoomPos.y - zoomSize / 2,
                                                left: zoomPos.x - zoomSize / 2,
                                                width: zoomSize,
                                                height: zoomSize,
                                                borderRadius: "50%",
                                                overflow: "hidden",
                                                boxShadow: "0 0 10px rgba(0,0,0,0.4)",
                                                pointerEvents: "none",
                                                border: "2px solid #fff",
                                                zIndex: 10,
                                            }}
                                        >
                                            <img
                                                src={`http://192.168.0.62:8000/api/image/view?session_id=${sessionId}&image_path=${encodeURIComponent(imagePath)}`}
                                                alt="Zoomed area"
                                                style={{
                                                    position: "absolute",
                                                    left: -zoomPos.x * zoomFactor + zoomSize / 2,
                                                    top: -zoomPos.y * zoomFactor + zoomSize / 2,
                                                    width: 800 * zoomFactor,
                                                }}
                                            />
                                        </div>)}
                                </div>
                                {sessionInfo ? <div className="session_info">
                                    <h2>instructions:</h2>
                                    <p style={{paddingLeft: 20}}>{sessionInfo}</p>
                                </div> : null}
                                <p className="tagger-tag">Current tag: <b>{tag}</b></p>

                                <div style={{display: "flex", gap: "20px", marginTop: 10}}>
                                    <button className="tagger-button" onClick={() => nextImage(-1)}>Prev</button>
                                    <button className="tagger-button" onClick={() => nextImage(1)}>Next</button>
                                    <button className="tagger-button" onClick={() => saveSession(false)}>Save
                                    </button>
                                    <button className="tagger-button" onClick={endSession}>Exit Session</button>
                                </div>
                                {message && <div className="tagger-message">{message}</div>}



                            </div>
                        )}
                    </div>
                )}
        </div>
    );
}
