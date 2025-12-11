import React from 'react';

export default function HourlySummary({ hourly }) {
  if (!hourly) return <div>Loading...</div>;
  const hours = Object.keys(hourly).sort((a,b)=>a-b);
  return (
    <table className="card">
      <thead>
        <tr>
          <th>Hour</th>
          <th>Temp Avg</th>
          <th>Humid Avg</th>
          <th>Count</th>
        </tr>
      </thead>
      <tbody>
        {hours.map(h => (
          <tr key={h}>
            <td>{h}:00</td>
            <td>{hourly[h].temp.avg}</td>
            <td>{hourly[h].humid.avg}</td>
            <td>{hourly[h].count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}