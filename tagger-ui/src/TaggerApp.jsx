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

const Toggle = ({label, value, onChange}) => (
    <label className="toggle-container" style={{display: "flex", alignItems: "center", gap:"5px"}}>
        <label className={"toggle"} style={{ cursor: "pointer"}}>
            <input
                type="checkbox"
                checked={value}
                onChange={e => onChange(e.target.checked)}
            />
            <span className="toggle-slider" />

        </label>
        <span>{label}</span>
    </label>

);

function getContainedImageRect(img, container) {
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const containerRatio = container.clientWidth / container.clientHeight;

    let width, height;

    if (imgRatio > containerRatio) {
        // image constrained by width
        width = container.clientWidth;
        height = width / imgRatio;
    } else {
        // image constrained by height
        height = container.clientHeight;
        width = height * imgRatio;
    }

    const x = (container.clientWidth - width) / 2;
    const y = (container.clientHeight - height) / 2;

    return { x, y, width, height };
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
    const [showZoom, setShowZoom] = useState(true);
    const [showPath, setShowPath] = useState(true);
    const [showInstructions, setShowInstructions] = useState(true);

    const zoomFactor = 2; // You can set 2x, 3x, etc.
    const zoomSize = 200; // Size of the circular lens in pixels
    const containerRef = useRef(null);
    const imgRef = useRef(null);
    const [points, setPoints] = useState([]);
    useEffect(() => {
        setPoints([]);
    }, [imagePath]);


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
                axios.post("/api/session/continue", {session_id: parsed.sessionId})
                    .then(async (res) => {
                        setSessionId(res.data.session_id);
                        setTaggerName(parsed.taggerName);
                        setSubject(res.data.subject);
                        setSessionInfo(res.data.info);
                        // get current image
                        const next = await axios.get("/api/image/next", {params: {session_id: res.data.session_id}});
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
                {session_id: selectedOpen});
            setSessionId(res.data.session_id);
            setSessionInfo(res.data.info);

            // Get next image & state for that session
            const next = await axios.get("/api/image/next", {params: {session_id: res.data.session_id}});
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

        const tags = res.data.tags || [];

        const textTags = [];
        const pointTags = [];

        for (const t of tags) {
            const p = parsePointTag(t);
            if (p) {
                pointTags.push(p);
                // textTags.push(t);
                textTags.push(`P(${p.nx.toFixed(2)},${p.ny.toFixed(2)})`);
            } else {
                textTags.push(t);
            }
        }

        setTag(textTags.join(", "));
        setPoints(pointTags);

        await updateState(sessId);
    };

    const handleImageClick = async (e) => {
        if (!imgRef.current || !sessionId || !imagePath) return;

        const imgRect = imgRef.current.getBoundingClientRect();

        const x = e.clientX - imgRect.left;
        const y = e.clientY - imgRect.top;

        // guard: ignore clicks outside image
        if (x < 0 || y < 0 || x > imgRect.width || y > imgRect.height) return;

        const nx = x / imgRect.width;
        const ny = y / imgRect.height;

        const pointStr = `(${nx.toFixed(5)}|${ny.toFixed(5)})`;

        try {
            await axios.post("/api/image/tag", {
                session_id: sessionId,
                image_path: imagePath,
                tag: pointStr,
            });

            await updateCurrentTag();
        } catch (err) {
            console.error("Failed to save point tag", err);
        }
    };


    const parsePointTag = (s) => {
        if (typeof s !== "string") return null;
        if (!s.startsWith("(") || !s.endsWith(")")) return null;

        const inner = s.slice(1, -1);
        const parts = inner.split("|");
        if (parts.length !== 2) return null;

        const nx = Number(parts[0]);
        const ny = Number(parts[1]);

        if (Number.isNaN(nx) || Number.isNaN(ny)) return null;

        return {nx, ny};
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

    const parseImgPath = (path) => {
        if (typeof path !== "string") return null;

        const marker = "/data/";
        const idx = path.indexOf(marker);

        if (idx === -1) return path; // data not found

        return path.slice(idx + marker.length);
    };
    useEffect(() => {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(prefersDark);
    }, []);

    const imgRect = imgRef.current?.getBoundingClientRect();

    return (
        <div className="tagger-container">
            <img alt={"diptera_logo"} src={"/diptera_logo.svg"} className={"logo"}></img>
            <button
                className="tagger-button"
                onClick={() => setDarkMode(!darkMode)}
                style={{position: "absolute", top: 10, left: 10, width: 120}}
            >
                {darkMode ? "Light Mode" : "Dark Mode"}
            </button>
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
                ) :
                (
                    <div className="tagger-content-session">


                        <div className="tagger-headline">
                            <h3 className="tagger-title">
                                Tagger: <span className="tagger-name">{taggerName}</span>
                            </h3>
                            <div className="tagger-subtitle">
                                Subject: <span className="tagger-subject">{subject}</span>
                            </div>
                        </div>

                        <Progress state={state}/>
                        {imagePath && (
                            <div
                                ref={containerRef}
                                style={{
                                    position: "relative",
                                    width: "max-content",
                                }}
                            >
                                <div>
                                    <div className="tagger-image-frame">
                                        <img
                                            ref={imgRef}
                                            className="tagger-image"
                                            src={`http://100.76.177.32:8000/api/image/view?session_id=${sessionId}&image_path=${encodeURIComponent(imagePath)}`}
                                            alt="current"
                                            onMouseMove={(e) => {
                                                const rect = imgRef.current.getBoundingClientRect();
                                                setZoomPos({
                                                    x: e.clientX - rect.left,
                                                    y: e.clientY - rect.top
                                                });
                                            }}
                                            onMouseLeave={() => setZoomPos(null)}
                                            onClick={handleImageClick}

                                        />

                                    </div>
                                    {points.map((p, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                position: "absolute",
                                                left: `${p.nx * 100}%`,
                                                top: `${p.ny * 100}%`,
                                                width: 4,
                                                height: 4,
                                                borderRadius: "50%",
                                                background: "#ff3b3b",
                                                border: "1px solid white",
                                                pointerEvents: "none",
                                                transform: "translate(-50%, -50%)"

                                            }}
                                        />
                                    ))}
                                    {zoomPos && showZoom && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: zoomPos?.y - zoomSize / 2,
                                                left: zoomPos?.x - zoomSize / 2,
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
                                                    width: imgRect ? imgRect.width * zoomFactor : "auto",
                                                    height: imgRect ? imgRect.height * zoomFactor : "auto",
                                                }}
                                            />
                                            {points.map((p, i) => {
                                                const px = p.nx * imgRect.width * zoomFactor;
                                                const py = p.ny * imgRect.height * zoomFactor;

                                                const cx = zoomPos.x * zoomFactor;
                                                const cy = zoomPos.y * zoomFactor;

                                                return (
                                                    <div
                                                        key={i}
                                                        style={{
                                                            position: "absolute",
                                                            left: px - cx + zoomSize / 2,
                                                            top: py - cy + zoomSize / 2,
                                                            width: 8,
                                                            height: 8,
                                                            borderRadius: "50%",
                                                            background: "#ff3b3b",
                                                            border: "1px solid white",
                                                            pointerEvents: "none",
                                                            transform: "translate(-50%, -50%)"

                                                        }}
                                                    />
                                                );
                                            })}

                                        </div>)}
                                </div>


                            </div>

                        )}
                        {(sessionInfo && showInstructions) ?
                            <div className="session_info">
                                <h2>instructions:</h2>
                                <p style={{paddingLeft: 20}}>{sessionInfo}</p>
                            </div> : null}


                        <div className="tagger-tag">Current Tag: <b>{tag}</b></div>
                        {showPath && <div className="tagger-tag">Image Path: <b>{parseImgPath(imagePath)}</b></div>
                        }
                        <div style={{display: "flex", gap: "20px", marginTop: 10}}>
                            <Toggle
                                label="magnifier 🔍"
                                value={showZoom}
                                onChange={setShowZoom}
                            />
                            <Toggle
                                label="image path 🧭"
                                value={showPath}
                                onChange={setShowPath}
                            />
                            {sessionInfo ?
                                <Toggle
                                    label="instructions 📖"
                                    value={showInstructions}
                                    onChange={setShowInstructions}
                                /> : null
                            }
                        </div>

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
    );
}
