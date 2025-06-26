import React, {useEffect, useState} from "react";
import axios from "axios";
import "./style.css";

axios.defaults.baseURL = "http://192.168.0.62:8000";

function Progress({state}) {
    if (!state || typeof state.cur === "undefined") return null;
    const percent = state.total > 0 ? Math.round((state.tagged / state.total) * 100) : 0;
    return (
        <div style={{marginBottom: 10}}>
            <p>Progress: <b>{state.cur}</b> / {state.total} | Tagged: {state.tagged}</p>
            <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{width: `${percent}%`}}></div>
            </div>
        </div>
    );
}

export default function TaggerApp() {
    const [subjects, setSubjects] = useState([]);
    const [subject, setSubject] = useState("");
    const [taggerName, setTaggerName] = useState("");
    const [sessionId, setSessionId] = useState(null);
    const [imagePath, setImagePath] = useState(null);
    const [tag, setTag] = useState("");
    const [message, setMessage] = useState("");
    const [state, setState] = useState(null);
    const [warning, setWarning] = useState(null);
    const [noImages, setNoImages] = useState(false);


    useEffect(() => {
        axios.get("/api/subjects").then((res) => setSubjects(res.data));
    }, []);

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
            const next = await axios.get("/api/image/next",
                {params: {session_id: res.data.session_id}});
            setImagePath(next.data.image_path);
            await updateCurrentTag(res.data.session_id, next.data.image_path);
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

    const nextImage = async (step = 1) => {
        const route = step === 1 ? "next" : "prev";
        try {
            const res = await axios.get(`/api/image/${route}`, {params: {session_id: sessionId}});
            setImagePath(res.data.image_path);
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
        setSessionId(null);
        setImagePath(null);
        setMessage("Session ended");
    };

    return (
        <div className="tagger-container">
            <img alt={"diptera_logo"} src={"/diptera_logo.svg"} className={"logo"}></img>
            {!sessionId ? (
                <div className="tagger-content">
                    <h2>Start Tagging Session</h2>
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
                    {warning && <div className="tagger-warning">{warning}</div>}
                </div>
            ) : noImages ? (
                <div className="tagger-content">
                    <h4>No More Images :)</h4>
                    <button className="tagger-button" onClick={() => {setSessionId(null)}}>
                        Finish
                    </button>
                </div>
                ) :
                (
                <div className="tagger-content-session">
                    <h3>Tagger: {taggerName}</h3>
                    <Progress state={state}/>
                    {imagePath && (
                        <div>
                            <img
                                className="tagger-image"
                                src={`http://192.168.0.62:8000/api/image/view?session_id=${sessionId}&image_path=${encodeURIComponent(imagePath)}`}
                                alt="current"
                            />
                            <p className="tagger-tag">Current tag: <b>{tag}</b></p>

                            <div style={{display: "flex", gap: "20px", marginTop: 10}}>
                                <button className="tagger-button" onClick={() => nextImage(-1)}>Prev</button>
                                <button className="tagger-button" onClick={() => nextImage(1)}>Next</button>
                                <button className="tagger-button" onClick={() => saveSession(false)}>Save</button>
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
