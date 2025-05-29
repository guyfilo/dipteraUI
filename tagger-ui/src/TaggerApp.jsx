import React, { useEffect, useState } from "react";
import axios from "axios";

export default function TaggerApp() {
    const [subjects, setSubjects] = useState([]);
    const [subject, setSubject] = useState("");
    const [taggerName, setTaggerName] = useState("");
    const [sessionId, setSessionId] = useState(null);
    const [imagePath, setImagePath] = useState(null);
    const [tag, setTag] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        axios.get("/api/subjects").then((res) => setSubjects(res.data));
    }, []);

    const startSession = async () => {
        const res = await axios.post("/api/session/create", {
            tagger_name: taggerName,
            subject: subject,
            skip_tagged_images: true,
        });
        setSessionId(res.data.session_id);
        const next = await axios.get("/api/image/next", { params: { session_id: res.data.session_id } });
        setImagePath(next.data.image_path);
    };

    const nextImage = async (step = 1) => {
        const route = step === 1 ? "next" : "prev";
        const res = await axios.get(`/api/image/${route}`, { params: { session_id: sessionId } });
        setImagePath(res.data.image_path);
    };

    const sendTag = async () => {
        await axios.post("/api/image/tag", {
            session_id: sessionId,
            image_path: imagePath,
            tag,
        });
        setTag("");
        await saveSession(true);
        nextImage(1);
    };

    const saveSession = async (silent = false) => {
        await axios.post("/api/session/save", sessionId, {
            headers: { 'Content-Type': 'application/json' }
        });
        if (!silent) setMessage("Session saved");
    };

    const endSession = async () => {
        await axios.post("/api/session/exit", sessionId, {
            headers: { 'Content-Type': 'application/json' }
        });
        setSessionId(null);
        setImagePath(null);
        setMessage("Session ended");
    };

    return (
        <div style={{ padding: 20 }}>
            {!sessionId ? (
                <div>
                    <h2>Start Tagging Session</h2>
                    <input
                        placeholder="Your Name"
                        value={taggerName}
                        onChange={(e) => setTaggerName(e.target.value)}
                    />
                    <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                        <option value="">Select Subject</option>
                        {subjects.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                    <button onClick={startSession}>Start</button>
                </div>
            ) : (
                <div>
                    <h3>Session: {sessionId}</h3>
                    {imagePath && (
                        <div>
                            <img
                                src={`/api/image/thumbnail?session_id=${sessionId}&image_path=${encodeURIComponent(imagePath)}&width=512`}
                                alt="current"
                                style={{ maxWidth: "100%", maxHeight: 400 }}
                            />
                            <div>
                                <input
                                    placeholder="Tag"
                                    value={tag}
                                    onChange={(e) => setTag(e.target.value)}
                                />
                                <button onClick={sendTag}>Tag</button>
                                <button onClick={() => nextImage(-1)}>Prev</button>
                                <button onClick={() => nextImage(1)}>Next</button>
                                <button onClick={() => saveSession(false)}>Save</button>
                                <button onClick={endSession}>Exit Session</button>
                            </div>
                            {message && <div style={{ marginTop: 10, color: "green" }}>{message}</div>}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
