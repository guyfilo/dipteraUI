import { useEffect, useState, useCallback } from "react";
import { getLive } from "../api/live";

export function useLiveData(room, ip) {
  const [data, setData] = useState(null);

  useCallback(async () => {
    try {
      const res = await getLive(room, ip);
      setData(res);
    } catch {
      setData({ error: true });
    }
  }, [room, ip]);

  useEffect(() => {
    let alive = true;

    const safeRefresh = async () => {
      try {
        const res = await getLive(room, ip);
        if (alive) setData(res);
      } catch {
        if (alive) setData({ error: true });
      }
    };

    safeRefresh();
    const t = setInterval(safeRefresh, 60_000);

    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [room, ip]);

  return data;
}
