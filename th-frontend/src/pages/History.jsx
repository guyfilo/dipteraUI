import React, { useState } from 'react';
import { useHistoryData } from "../hooks/useHistoryData";
import DualChartCard from "../components/ChartCard";

export default function History({ rooms, date }) {


    const { data } = useHistoryData(rooms, date);
    return (
        <div>
            <DualChartCard data={data} selectedRooms={rooms} date={date} />
        </div>
    );
}
