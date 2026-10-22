import React, {useContext, useEffect, useState} from 'react';
import {DataContext} from '../../communication/DataContext.jsx';
import SessionNotebook, {formatNotebookDate} from './SessionNotebook.jsx';
import './style.css';

export default function SessionNotebookList() {
    const {fetchSessionNotebooks} = useContext(DataContext);
    const [notebooks, setNotebooks] = useState([]);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [reload, setReload] = useState(0);
    useEffect(() => {
        let active = true;
        let fetching = false;
        const controller = new AbortController();
        const refresh = async () => {
            if (fetching) return;
            fetching = true;
            try {
                const result = await fetchSessionNotebooks(controller.signal);
                if (active) {
                    setNotebooks(result.notebooks);
                    setError('');
                }
            } catch (failure) {
                if (active && failure.name !== 'AbortError') setError(failure.message);
            } finally {
                fetching = false;
                if (active) setLoading(false);
            }
        };
        refresh();
        const interval = setInterval(refresh, 30000);
        window.addEventListener('focus', refresh);
        return () => {
            active = false;
            controller.abort();
            clearInterval(interval);
            window.removeEventListener('focus', refresh);
        };
    }, [fetchSessionNotebooks, reload]);
    return <section className="session-notebook session-notebook-list" aria-label="Session notebooks">
        <div className="session-notebook-header">
            <button type="button" className="session-notebook-toggle" aria-expanded={open}
                    onClick={() => setOpen(value => !value)}>
                {open ? '▾' : '▸'} Session notebooks ({notebooks.length})
            </button>
            {open && <button type="button" onClick={() => setReload(value => value + 1)}>Refresh notebooks</button>}
        </div>
        {open && <>
            <p className="session-notebook-hint">All sessions with saved notes, including sessions without a generated report.</p>
            {loading && <p role="status">Loading notebooks…</p>}
            {error && <p role="alert" className="session-notebook-error">{error}</p>}
            {!loading && !error && !notebooks.length && <p>No session notes have been saved yet.</p>}
            {notebooks.map(notebook => <article key={notebook.session_id}>
                <h4>{notebook.session_title}</h4>
                <small>{notebook.entry_count} {notebook.entry_count === 1 ? 'note' : 'notes'} · Last note {formatNotebookDate(notebook.last_entry_at)}</small>
                <SessionNotebook sessionId={notebook.session_id} collapsible/>
            </article>)}
        </>}
    </section>;
}
