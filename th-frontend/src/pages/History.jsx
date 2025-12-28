import React, { useState } from 'react';
import { useHistoryData } from "../hooks/useHistoryData";
import ChartCard from "../components/ChartCard";

export default function History({ rooms, range }) {

    const { data } = useHistoryData(rooms, range);

    if (!range) return null;

    return (
        <ChartCard
            data={data}
            selectedRooms={rooms}
            fromdate={range.from}
            todate={range.to}
        />
    );
}