import { useEffect, useState } from "react";
import { getLive } from "../api/live";

export function useLiveData(room, ip) {
  const [data, setData] = useState(null);

  async function refresh() {
    try { setData(await getLive(room, ip)); }
    catch { setData({ error: true }); }
  }

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 60000);
    return () => clearInterval(t);
  }, [room, ip]);

  return data;
}