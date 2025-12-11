import React from 'react';


export default function RoomSelector({ rooms, value, onChange }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}>
      {rooms.map(r => <option key={r} value={r}>{r}</option>)}
    </select>
  );
}