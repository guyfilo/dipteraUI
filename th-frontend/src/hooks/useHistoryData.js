import { useEffect, useState, useRef } from "react";
import { getDay } from "../api/history";

export function useHistoryData(rooms, date) {
    const [merged, setMerged] = useState(null);

    // cache structure: cache.current[date][room] = data
    const cache = useRef({});

    // --- Load cache from localStorage on first load ---
    useEffect(() => {
        const saved = localStorage.getItem("historyCache");
        if (saved) {
            try {
                cache.current = JSON.parse(saved);
            } catch {}
        }
    }, []);

    // --- Save cache to localStorage whenever it changes ---
    function saveCache() {
        localStorage.setItem("historyCache", JSON.stringify(cache.current));
    }

    useEffect(() => {
        if (!rooms || rooms.length === 0 || !date) return;

        async function load() {
            if (!cache.current[date]) {
                cache.current[date] = {};
            }

            const missingRooms = rooms.filter(
                r => !cache.current[date][r]
            );

            // Fetch only missing rooms
            if (missingRooms.length > 0) {
                const results = await Promise.all(
                    missingRooms.map(r => getDay(r, date))
                );

                results.forEach((d, i) => {
                    cache.current[date][missingRooms[i]] = {
                        room: missingRooms[i],
                        timestamps: d.timestamps,
                        temp: d.temp,
                        humid: d.humid,
                    };
                });

                saveCache();   // <-- persist after fetching new data
            }

            // Combine from cache
            const combined = rooms.map(r => cache.current[date][r]);
            setMerged(combined);
        }

        load();
    }, [rooms, date]);

    return { data: merged };
}
