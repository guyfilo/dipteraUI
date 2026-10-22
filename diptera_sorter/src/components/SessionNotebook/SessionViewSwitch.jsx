import React from 'react';
import './view-switch.css';

export const NotebookIcon = ({className, size = 23}) => <svg className={className} width={size} height={size}
    viewBox="0 0 23 21" fill="none" aria-hidden="true" focusable="false">
    <rect x="5" y="3" width="14" height="15" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8 3v15M3.5 6h3M3.5 10.5h3M3.5 15h3M11 7h5M11 10.5h5M11 14h3"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
</svg>;

const labels = {table: 'Table', charts: 'Charts', notebook: 'Notebook'};

export default function SessionViewSwitch({mode, onChange, options = ['table', 'charts', 'notebook'], label = 'Session view'}) {
    return <div className="session-view-switch" role="group" aria-label={label}>
        {options.map(option => <button key={option} type="button" aria-label={labels[option]}
            title={labels[option]} aria-pressed={mode === option}
            className="session-view-button" onClick={() => onChange(option)}>
            {option === 'notebook' ? <NotebookIcon/> :
                <img src={option === 'charts' ? '/status=graph.svg' : '/status=table.svg'} alt=""/>}
        </button>)}
    </div>;
}
