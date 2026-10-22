import React, {useContext, useEffect, useId, useRef, useState} from 'react';
import {DataContext} from '../../communication/DataContext.jsx';
import './style.css';

export const formatNotebookDate = (value) => new Date(value).toLocaleString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

const mergeEntries = (previous, incoming) => {
    const entries = new Map(previous.map(entry => [entry.id, entry]));
    incoming.forEach(entry => entries.set(entry.id, entry));
    return [...entries.values()].sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id));
};
const readDraft = (key) => {
    try { return JSON.parse(sessionStorage.getItem(key)) || {}; } catch { return {}; }
};
const newRequestId = () => {
    if (crypto.randomUUID) return crypto.randomUUID();
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    const hex = [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
};
const kindLabel = {note: 'Note', issue: 'Issue', error: 'Error'};
const noMachines = [];

export default function SessionNotebook({sessionId, machineIds = noMachines, collapsible = false}) {
    const {serverName} = useContext(DataContext);
    return <NotebookBody key={`${serverName}:${sessionId}`} sessionId={sessionId} machineIds={machineIds}
                         draftKey={`diptera:notebook:${serverName}:${sessionId}`} collapsible={collapsible}/>;
}

function NotebookBody({sessionId, machineIds, draftKey, collapsible}) {
    const typeHintId = useId();
    const {fetchSessionNotebook, addSessionComment} = useContext(DataContext);
    const [draft] = useState(() => readDraft(draftKey));
    const [open, setOpen] = useState(!collapsible);
    const [entries, setEntries] = useState([]);
    const [machines, setMachines] = useState(machineIds);
    const [composerOpen, setComposerOpen] = useState(false);
    const noteInput = useRef(null);
    const [text, setText] = useState(draft.text || '');
    const [author, setAuthor] = useState(draft.author || '');
    const [kind, setKind] = useState(kindLabel[draft.kind] ? draft.kind : 'note');
    const [scope, setScope] = useState(draft.scope === 'machines' ? 'machines' : 'session');
    const [selectedMachines, setSelectedMachines] = useState(Array.isArray(draft.machineIds) ? draft.machineIds : []);
    const [attempt, setAttempt] = useState(draft.attempt || null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [saveError, setSaveError] = useState('');
    const [reload, setReload] = useState(0);
    const savingRef = useRef(false);

    useEffect(() => { if (composerOpen) noteInput.current?.focus(); }, [composerOpen]);
    useEffect(() => {
        try {
            if (text || author) sessionStorage.setItem(draftKey, JSON.stringify({text, author, kind, scope, machineIds: selectedMachines, attempt}));
            else sessionStorage.removeItem(draftKey);
        } catch { /* The editor also works when browser storage is disabled. */ }
    }, [draftKey, text, author, kind, scope, selectedMachines, attempt]);

    useEffect(() => {
        if (!open) return;
        let active = true;
        let fetching = false;
        const controller = new AbortController();
        setLoading(true);
        const refresh = async () => {
            if (fetching) return;
            fetching = true;
            try {
                const notebook = await fetchSessionNotebook(sessionId, controller.signal);
                if (active) {
                    setEntries(previous => mergeEntries(previous, notebook.entries));
                    if (Array.isArray(notebook.machine_ids)) setMachines(notebook.machine_ids);
                    setLoadError('');
                }
            } catch (error) {
                if (active && error.name !== 'AbortError') setLoadError(error.message);
            } finally {
                fetching = false;
                if (active) setLoading(false);
            }
        };
        refresh();
        const interval = setInterval(refresh, 15000);
        window.addEventListener('focus', refresh);
        return () => {
            active = false;
            controller.abort();
            clearInterval(interval);
            window.removeEventListener('focus', refresh);
        };
    }, [sessionId, open, reload, fetchSessionNotebook]);

    const targets = machines.length === 1 || scope === 'session'
        ? machines : selectedMachines.filter(machine => machines.includes(machine));
    const allSelected = machines.length > 0 && targets.length === machines.length;
    const machineScope = machines.length === 1 || (machines.length > 0 && !allSelected);
    const invalidScope = machines.length > 0 && targets.length === 0;
    const toggleMachine = (machine) => {
        setSelectedMachines(targets.includes(machine)
            ? targets.filter(value => value !== machine) : [...targets, machine]);
        setScope('machines');
    };

    const submit = async (event) => {
        event.preventDefault();
        if (!text.trim() || invalidScope || savingRef.current) return;
        savingRef.current = true;
        setSaving(true);
        setSaveError('');
        const payload = {kind, scope: machineScope ? 'machines' : 'session', machine_ids: machineScope ? [...targets].sort() : null};
        const key = JSON.stringify({text: text.trim(), author: author.trim(), ...payload});
        const token = attempt?.key === key ? attempt : {key, request_id: newRequestId()};
        setAttempt(token);
        try {
            const entry = await addSessionComment(sessionId, text.trim(), author.trim(), {...payload, request_id: token.request_id});
            setEntries(previous => mergeEntries(previous, [entry]));
            setText('');
            setKind('note');
            setScope('session');
            setSelectedMachines([]);
            setAttempt(null);
            setComposerOpen(false);
            try {
                const saved = readDraft(draftKey);
                if (saved.attempt?.request_id === token.request_id) sessionStorage.removeItem(draftKey);
            } catch {}
        } catch (error) { setSaveError(error.message); }
        finally { savingRef.current = false; setSaving(false); }
    };

    return <section className="session-notebook" aria-label="Session notebook">
        <div className="session-notebook-header">
            {collapsible ? <button type="button" className="session-notebook-toggle" aria-expanded={open}
                                   onClick={() => setOpen(value => !value)}>
                {open ? '▾' : '▸'} Session Notebook
            </button> : <h3>Session Notebook</h3>}
            {open && <div className="session-notebook-actions">
                <button type="button" className="session-notebook-refresh" aria-label="Refresh notes" title="Refresh notes"
                        disabled={loading} onClick={() => setReload(value => value + 1)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M20 7v5h-5M4 17v-5h5"/>
                        <path d="M6.1 6.1A8 8 0 0 1 19.5 9L20 12M4 12l.5 3A8 8 0 0 0 17.9 17.9"/>
                    </svg>
                </button>
                <button type="button" className="session-notebook-new" aria-expanded={composerOpen}
                        disabled={saving || (!composerOpen && loading)}
                        onClick={() => { setSaveError(''); setComposerOpen(value => !value); }}>
                    {composerOpen ? 'Cancel' : 'New note'}
                </button>
            </div>}
        </div>
        {open && <>
            {loadError && <p className="session-notebook-error" role="alert">{loadError}</p>}
            {loading && <p role="status">Loading notes…</p>}
            {!loading && !loadError && entries.length === 0 && !composerOpen && <p className="session-notebook-empty">No notes yet.</p>}
            {composerOpen && <form onSubmit={submit} className="session-notebook-form" aria-label="New note">
                <h4>New note</h4>
                <label>Write your note
                    <textarea ref={noteInput} aria-label="Note" value={text} onChange={event => setText(event.target.value)} rows={3}
                              maxLength={10000} disabled={saving} placeholder="What happened, and what did the team do?" required/>
                </label>
                {machines.length === 1 && <p className="session-notebook-scope-hint">Applies to <strong>{machines[0]}</strong></p>}
                {machines.length > 1 && <fieldset className="session-notebook-machine-picker" disabled={saving}>
                    <legend>Select machines for this note</legend>
                    <label>
                        <input type="checkbox" checked={allSelected}
                               ref={input => { if (input) input.indeterminate = targets.length > 0 && !allSelected; }}
                               onChange={event => {
                                   setScope(event.target.checked ? 'session' : 'machines');
                                   setSelectedMachines([]);
                               }}/>Select all
                    </label>
                    {machines.map(machine => <label key={machine}>
                        <input type="checkbox" checked={targets.includes(machine)} onChange={() => toggleMachine(machine)}/>{machine}
                    </label>)}
                    {invalidScope && <span className="session-notebook-scope-hint">Select at least one machine.</span>}
                </fieldset>}
                {!machines.length && <p className="session-notebook-scope-hint">No machine information is available. This note will be saved for the session.</p>}
                <div className="session-notebook-fields">
                    <label>Type
                        <select aria-label="Type" value={kind} onChange={event => setKind(event.target.value)} disabled={saving}
                                aria-describedby={typeHintId}>
                            <option value="note">Note</option><option value="issue">Issue</option><option value="error">Error</option>
                        </select>
                    </label>
                    <label>Your name (optional)
                        <input value={author} onChange={event => setAuthor(event.target.value)} maxLength={100}
                               disabled={saving} autoComplete="name" placeholder="e.g. Guy"/>
                    </label>
                </div>
                <p className="session-notebook-scope-hint" id={typeHintId}>
                    {kind === 'note' ? 'Notes appear in the session’s timeline comments.'
                        : `${kindLabel[kind]}s also appear as separate events in the selected machines’ timelines.`}
                </p>
                <div className="session-notebook-submit">
                    <div className="session-notebook-form-buttons">
                        <button type="submit" disabled={saving || !text.trim() || invalidScope}>{saving ? 'Saving…' : 'Save note'}</button>
                    </div>
                    {saveError && <p className="session-notebook-error" role="alert">{saveError}</p>}
                </div>
            </form>}
            <ol className="session-notebook-entries" aria-label="Session notes" aria-live="polite">
                {entries.slice().reverse().map(entry => {
                    const entryKind = entry.data.kind || (entry.type === 'comment' ? 'note' : entry.type);
                    const affected = entry.data.machine_ids || [];
                    return <li key={entry.id}>
                        <div className="session-notebook-entry-meta">
                            <span className="session-note-kind" data-kind={entryKind}>{kindLabel[entryKind] || 'Note'}</span>
                            <span className="session-note-scope">{entry.data.scope === 'session' ? 'Entire session' : affected.join(', ') || 'Session'}
                                {entry.data.scope === 'session' && affected.length > 0 && ` · ${affected.join(', ')}`}</span>
                            <time dateTime={entry.created_at}>{formatNotebookDate(entry.created_at)}</time>
                            <strong>{entry.author || 'Team note'}</strong>
                        </div>
                        <p dir="auto">{entry.data.text}</p>
                    </li>;
                })}
            </ol>
        </>}
    </section>;
}
