import { useEffect, useState, useRef } from "react";
import { getRange } from "../api/history";

export function useHistoryData(rooms, range) {
    const [merged, setMerged] = useState(null);

    // in-memory cache only
    const cache = useRef({});
    const key = range ? `${range.from}__${range.to}` : null;

    useEffect(() => {
        if (!rooms?.length || !range?.from || !range?.to) return;

        async function load() {
            // ✅ initialize cache bucket
            if (!cache.current[key]) {
                cache.current[key] = {};
            }

            // only fetch missing rooms
            const missing = rooms.filter(
                r => !cache.current[key][r]
            );

            if (missing.length > 0) {
                const results = await Promise.all(
                    missing.map(r =>
                        getRange(r, range.from, range.to)
                    )
                );

                results.forEach((d, i) => {
                    cache.current[key][missing[i]] = {
                        room: missing[i],
                        timestamps: d.timestamps,
                        temp: d.temp,
                        humid: d.humid,
                    };
                });
            }

            setMerged(
                rooms.map(r => cache.current[key][r])
            );
        }

        load();
    }, [rooms, range?.from, range?.to]);

    return { data: merged };
}
